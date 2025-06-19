package com.firemap.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.firemap.backend.service.GuidelineService;

@RestController
@RequestMapping("/guidelines")
public class GuidelineController {

    @Autowired
    private GuidelineService guidelineService;

    // 상황 목록 조회
    @GetMapping
    public List<String> listSituations() {
        return guidelineService.listSituations();
    }

    // 상황별 행동요령 조회
    @GetMapping("/{situation}")
    public String getGuideline(@PathVariable String situation) {
        return guidelineService.getGuideline(situation);
    }
}