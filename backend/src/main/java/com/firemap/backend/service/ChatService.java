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

    public String askGpt(String question) {
        try {
            System.out.println("사용자 질문: " + question);

            if (question == null || question.trim().length() < 2 || question.matches("^[ㄱ-ㅎㅏ-ㅣ]+$")) {
                return "궁금하신 내용을 조금 더 자세히 입력해 주세요. 예: '아파트 화재 발생 시 어떻게 대피해야 하나요?'";
            }

            if (isClearlyIrrelevant(question)) {
                return "죄송합니다. 이 서비스는 화재, 대피, 응급 상황과 관련된 질문에만 응답합니다.";
            }

            // 화상 판단
            String classifyPrompt = """
당신은 사용자로부터 화상 증상을 듣고 해당 증상이 1도, 2도, 3도, 4도 중 어디에 해당하는지 판단합니다.
'1', '2', '3', '4', 또는 '없음' 중 하나만 출력하세요. 설명은 필요 없습니다.
""";

            String burnDegree = callGpt(classifyPrompt, question).trim();
            System.out.println("✅ GPT가 판단한 화상 정도: " + burnDegree);

            List<EmergencyInfoEntity> hospitals = switch (burnDegree) {
                case "1", "2" -> emergencyRepo.findByIsEmergencyRoomOperating("Y");
                case "3", "4" -> emergencyRepo.findByIsEmergencyRoomOperatingAndBurnCare("Y", "Y");
                default -> List.of();
            };

            String hospitalList = hospitals.isEmpty()
                    ? "조건에 맞는 병원이 없습니다."
                    : hospitals.stream()
                        .map(h -> "- " + h.getName() + " / " + h.getAddress() + " / ☎ " + h.getPhone())
                        .collect(Collectors.joining("\n"));

            String answerPrompt = """
사용자의 질문: [%s]
화상 정도: %s도
추천 병원 목록:
%s

위 내용을 바탕으로 사용자에게 자연스럽고 신뢰감 있게 응답을 생성해주세요.
""".formatted(question, burnDegree, hospitalList);

            String answer = callGpt(
                    "당신은 응급 대응을 돕는 화재 안전 안내원입니다. 당신의 이름은 화재 안내봇입니다. 응답은 신뢰감 있고 차분하며, 상황에 대한 정보와 병원 안내를 정확하게 전달해야 합니다. 이모티콘 없이, 안내 방송이나 관공서 매뉴얼처럼 말하세요.",
                    answerPrompt
            );

            System.out.println("최종 GPT 응답:\n" + answer);
            return answer;

        } catch (Exception e) {
            e.printStackTrace();
            return "시스템 오류로 인해 답변을 생성하지 못했습니다.";
        }
    }

    private boolean isClearlyIrrelevant(String question) {
        String[] irrelevantKeywords = {
                "요리", "레시피", "여행", "영화", "뉴스", "연예인", "게임"
        };
        question = question.toLowerCase();
        return Arrays.stream(irrelevantKeywords).anyMatch(question::contains);
    }

    private String callGpt(String systemPrompt, String userPrompt) throws IOException, InterruptedException {
        ObjectMapper mapper = new ObjectMapper();

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

        HttpClient client = HttpClient.newHttpClient();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        JsonNode jsonNode = mapper.readTree(response.body());
        JsonNode choices = jsonNode.get("choices");

        if (choices == null || !choices.isArray() || choices.size() == 0) {
            return "GPT 응답이 비정상적입니다.";
        }

        return choices.get(0).get("message").get("content").asText();
    }
}
