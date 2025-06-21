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
            System.out.println("✅ 사용자 질문: " + question);

            // 1. 화상 정도 추론 프롬프트
            String classifyPrompt = """
당신은 사용자로부터 화상 증상을 듣고 해당 증상이 1도, 2도, 3도, 4도 중 어디에 해당하는지 판단합니다.
'1', '2', '3', '4', 또는 '없음' 중 하나만 출력하세요. 설명은 필요 없습니다.
""";

            String burnDegree = callGpt(classifyPrompt, question).trim();
            System.out.println("✅ GPT가 판단한 화상 정도: " + burnDegree);

            if (burnDegree.equalsIgnoreCase("없음")) {
                return "다행입니다. 현재로선 응급 처치나 병원 진료는 필요 없어 보입니다.";
            }

            // 2. 화상 정도에 따라 병원 조회
            List<EmergencyInfoEntity> hospitals = switch (burnDegree) {
                case "1", "2" -> emergencyRepo.findByIsEmergencyRoomOperating("Y");
                case "3", "4" -> emergencyRepo.findByIsEmergencyRoomOperatingAndBurnCare("Y", "Y");
                default -> List.of();
            };
            System.out.println("✅ 조회된 병원 수: " + hospitals.size());

            String hospitalList = hospitals.isEmpty()
                    ? "조건에 맞는 병원이 없습니다."
                    : hospitals.stream()
                    .map(h -> "- " + h.getName() + " / " + h.getAddress() + " / ☎ " + h.getPhone())
                    .collect(Collectors.joining("\n"));

            // 3. 병원 목록 기반 GPT 응답 생성
            String answerPrompt = """
사용자의 질문: [%s]
화상 정도: %s도
추천 병원 목록:
%s

위 내용을 바탕으로 사용자에게 자연스럽게 응답을 생성해주세요.
""".formatted(question, burnDegree, hospitalList);

            System.out.println("GPT 응답 프롬프트:\n" + answerPrompt);

            String answer = callGpt("당신은 화재 안전 전문가입니다.", answerPrompt);
            System.out.println("최종 GPT 응답:\n" + answer);
            return answer;

        } catch (Exception e) {
            System.out.println("예외 발생:");
            e.printStackTrace();
            return "시스템 오류로 인해 답변을 생성하지 못했습니다.";
        }
    }

    // JSON 구조 안전하게 만드는 callGpt 메서드
    private String callGpt(String systemPrompt, String userPrompt) throws IOException, InterruptedException {
        ObjectMapper mapper = new ObjectMapper();

        // JSON 메시지 구성
        var messages = List.of(
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user", "content", userPrompt)
        );

        var requestBody = Map.of(
                "model", "gpt-3.5-turbo",
                "messages", messages
        );

        String body = mapper.writeValueAsString(requestBody); // JSON 직렬화

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.openai.com/v1/chat/completions"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + apiKey)
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

        HttpClient client = HttpClient.newHttpClient();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        System.out.println("GPT API 응답 원문:\n" + response.body());

        JsonNode jsonNode = mapper.readTree(response.body());
        JsonNode choices = jsonNode.get("choices");

        if (choices == null || !choices.isArray() || choices.size() == 0) {
            return "GPT 응답이 비정상적입니다.";
        }

        return choices.get(0).get("message").get("content").asText();
    }
}
