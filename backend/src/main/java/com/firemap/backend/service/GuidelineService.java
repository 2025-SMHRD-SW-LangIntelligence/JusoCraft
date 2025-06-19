package com.firemap.backend.service;

import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
public class GuidelineService {

    private static final String DATA_PATH = "data/";

    public List<String> listSituations() {
        List<String> situations = new ArrayList<>();
        try {
            var resource = Objects.requireNonNull(getClass().getClassLoader().getResource(DATA_PATH));
            var dir = new java.io.File(resource.getFile());
            for (var file : Objects.requireNonNull(dir.listFiles())) {
                if (file.getName().endsWith(".txt")) {
                    situations.add(file.getName().replace(".txt", ""));
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("상황 목록을 불러올 수 없습니다.", e);
        }
        return situations;
    }

    public String getGuideline(String situation) {
        try (var stream = getClass().getClassLoader().getResourceAsStream(DATA_PATH + situation + ".txt")) {
            if (stream == null) return "해당 상황에 대한 안내가 없습니다.";

            var reader = new BufferedReader(new InputStreamReader(stream, StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line).append("\n");
            }
            return sb.toString();
        } catch (Exception e) {
            return "해당 상황에 대한 안내가 없습니다.";
        }
    }
}