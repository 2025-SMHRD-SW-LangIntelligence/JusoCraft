package com.firemap.backend.controller;

import com.firemap.backend.service.GuidelineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class GuidelineController {

    @Autowired
    private GuidelineService guidelineService;

    @GetMapping("/situations")
    public List<String> getSituations() throws IOException {
        return guidelineService.listSituations();
    }

    @GetMapping("/guideline/{situation}")
    public String getGuideline(@PathVariable String situation) throws IOException {
        return guidelineService.getGuideline(situation);
    }
}
