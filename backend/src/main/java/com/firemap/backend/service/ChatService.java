package com.firemap.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.firemap.backend.entity.EmergencyInfoEntity;
import com.firemap.backend.repository.EmergencyInfoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    @Value("${openai.api-key}")
    private String apiKey;

    private final EmergencyInfoRepository emergencyRepo;
    private final ObjectMapper mapper = new ObjectMapper();

    public String askGpt(String question) {
        try {
            System.out.println("사용자 질문: " + question);

            if (question == null || question.trim().length() < 2 || question.matches("^[ㄱ-ㅎㅏ-ㅣ]+$")) {
                return "궁금하신 내용을 조금 더 자세히 입력해 주세요. 예: '아파트 화재 발생 시 어떻게 대피해야 하나요?'";
            }

            if (isClearlyIrrelevant(question)) {
                return "죄송합니다. 이 서비스는 화재, 대피, 응급 상황과 관련된 질문에만 응답합니다.";
            }

            // 1. 화상 정도 판단
            String classifyPrompt = """
당신은 사용자로부터 화상의 증상에 대한 설명을 받고, 해당 증상이 1도, 2도, 3도, 4도 화상 중 어디에 해당하는지 **숫자만** 출력해야 합니다.

- 1도 화상: 피부가 빨갛게 변하고 약간 따끔거리는 정도
- 2도 화상: 피부에 물집이 생기고 통증이 동반됨
- 3도 화상: 피부가 검게 타거나 흰색으로 변하며 통증이 심하거나 감각이 없음
- 4도 화상: 근육, 뼈까지 손상되며 생명에 위협이 될 수 있음

'없음'이라고 판단되면 '없음'만 출력하세요. 설명 없이 숫자 또는 '없음'만 출력합니다.
""";
            String burnDegree = callGpt(classifyPrompt, question).trim();
            System.out.println("GPT 화상 분류 결과: " + burnDegree);

            // 2. 병원 검색
            List<EmergencyInfoEntity> hospitals = switch (burnDegree) {
                case "1", "2" -> emergencyRepo.findByIsEmergencyRoomOperating("Y");
                case "3", "4" -> emergencyRepo.findByIsEmergencyRoomOperatingAndBurnCare("Y", "Y");
                default -> List.of();
            };

            // 3. 병원 연락처 목록 생성
            String hospitalList;
            if (hospitals.isEmpty()) {
                hospitalList = "조건에 맞는 병원이 없습니다.";
            } else {
                hospitalList = hospitals.stream()
                        .map(h -> {
                            String line = "- " + h.getName() + " / " + h.getAddress() + " / ☎ " + h.getPhone();
                            System.out.println("추천 병원: " + line);
                            return line;
                        })
                        .collect(Collectors.joining("\n"));
            }

            // 4. GPT에 보낼 질문 구성
            String answerPrompt = """
사용자의 질문: [%s]
화상 정도: %s도
추천 병원은 %d곳입니다. 이 중 가까운 병원을 방문해 주세요.
""".formatted(question, burnDegree, hospitals.size());

            // 5. GPT 호출
            String gptAnswer = callGpt(getSystemPrompt(), answerPrompt);
            System.out.println("GPT 응답:\n" + gptAnswer);

            // 6. 최종 응답에 병원 연락처 붙이기
            String fullAnswer = gptAnswer;
            if (!hospitals.isEmpty()) {
                fullAnswer += "\n\n추천 병원 연락처:\n" + hospitalList;
            }

            return fullAnswer;

        } catch (Exception e) {
            e.printStackTrace();
            return "시스템 오류로 인해 답변을 생성하지 못했습니다.";
        }
    }

    private String getSystemPrompt() {
        return """
당신은 화재 및 화상 응급처치 전문가입니다.
반드시 **화재, 화상, 연기 흡입, 응급 대피** 등과 관련된 질문에만 응답하십시오.

질문이 화재나 화상과 관련이 없으면 반드시 다음 문장만 출력하십시오:
"죄송합니다. 이 서비스는 화재, 대피, 응급 상황과 관련된 질문에만 응답합니다."

말투는 부드럽되 신뢰감 있게 유지하십시오.

사용자는 실제 화재를 겪거나 목격한 사람입니다. 절대로 다수에게 말하지 말고 항상 '귀하', '당신'과 같은 표현을 사용하십시오.
상황에 대한 공감이나 위로는 하지 말고, 병원, 대피, 응급 조치에 대한 안내는 간결하고 정확하게 전달하십시오.
이모티콘은 사용하지 마십시오.
""";
    }

    private boolean isClearlyIrrelevant(String question) {
        String[] irrelevantKeywords = {
                "요리", "레시피", "여행", "영화", "뉴스", "연예인", "게임", "라면", "조리법"
        };
        question = question.toLowerCase();
        return Arrays.stream(irrelevantKeywords).anyMatch(question::contains);
    }

    private String callGpt(String systemPrompt, String userPrompt) throws IOException, InterruptedException {
        var messages = List.of(
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user", "content", userPrompt)
        );

        var requestBody = Map.of(
                "model", "gpt-4o",
                "messages", messages
        );

        String body = mapper.writeValueAsString(requestBody);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.openai.com/v1/chat/completions"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + apiKey)
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

        HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());

        JsonNode choices = mapper.readTree(response.body()).get("choices");
        if (choices == null || !choices.isArray() || choices.size() == 0) {
            return "GPT 응답이 비정상적입니다.";
        }

        return choices.get(0).get("message").get("content").asText();
    }

}
