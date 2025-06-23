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
당신은 사용자로부터 화상 증상을 듣고 해당 증상이 1도, 2도, 3도, 4도 중 어디에 해당하는지 판단합니다.
'1', '2', '3', '4', 또는 '없음' 중 하나만 출력하세요. 설명은 필요 없습니다.
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
                "model", "gpt-3.5-turbo",
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

    private String getSystemPrompt() {
        return """
당신은 화재 전문가 입니다. 답변의 말투는 부드럽되 신뢰감있게 해야 합니다.
화재와 관련없는 답변은 하지마세요.

사용자는 실제 화재를 겪거나 목격한 사람입니다. 
절대로 다수의 사람에게 말하는 표현은 사용하지 마세요. 
항상 한 사람에게 말하듯 '귀하', '당신' 같은 표현을 사용하세요.

이모티콘 사용은 하지말고, 답변으로 상황에 대한 공감을 하지마세요.
병원, 대피, 응급 조치에 대한 안내는 간결하고 정확한 문장으로 전달하십시오.
""";
    }
}
