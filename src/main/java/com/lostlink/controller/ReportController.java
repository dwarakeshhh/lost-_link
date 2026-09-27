package com.lostlink.controller;

import com.lostlink.dto.ReportRequest;
import com.lostlink.model.Report;
import com.lostlink.service.ReportService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    // POST /api/reports
    @PostMapping
    public ResponseEntity<Report> createReport(@RequestBody @Valid ReportRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reportService.createReport(request));
    }

    // GET /api/reports  (admin view)
    @GetMapping
    public ResponseEntity<List<Report>> getAllReports() {
        return ResponseEntity.ok(reportService.getAllReports());
    }
}
