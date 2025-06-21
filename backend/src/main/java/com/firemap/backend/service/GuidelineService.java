// package com.firemap.backend.service;

// import org.springframework.stereotype.Service;
// import java.io.IOException;
// import java.nio.file.*;
// import java.util.List;
// import java.util.stream.Collectors;

// @Service
// public class GuidelineService {

//     private final Path dataPath = Paths.get("src/main/resources/data");

//     public List<String> listSituations() throws IOException {
//         return Files.list(dataPath)
//             .filter(p -> p.toString().endsWith(".txt"))
//             .map(p -> p.getFileName().toString().replace(".txt", ""))
//             .collect(Collectors.toList());
//     }

//     public String getGuideline(String situation) throws IOException {
//         Path file = dataPath.resolve(situation + ".txt");
//         if (!Files.exists(file)) {
//             return "해당 상황에 대한 안내가 없습니다.";
//         }
//         return Files.readString(file);
//     }
// }
