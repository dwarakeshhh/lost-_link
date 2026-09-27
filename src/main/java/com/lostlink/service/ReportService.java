package com.lostlink.service;

import com.lostlink.dto.ReportRequest;
import com.lostlink.exception.ResourceNotFoundException;
import com.lostlink.model.Report;
import com.lostlink.repository.ItemRepository;
import com.lostlink.repository.ReportRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ReportService {

    private final ReportRepository reportRepository;
    private final ItemRepository itemRepository;

    public ReportService(ReportRepository reportRepository, ItemRepository itemRepository) {
        this.reportRepository = reportRepository;
        this.itemRepository = itemRepository;
    }

    @Transactional
    public Report createReport(ReportRequest request) {
        if (!itemRepository.existsById(request.getItemId())) {
            throw new ResourceNotFoundException("Item not found with id: " + request.getItemId());
        }

        Report report = new Report();
        report.setItemId(request.getItemId());
        report.setReason(request.getReason());
        report.setDescription(request.getDescription());

        return reportRepository.save(report);
    }

    @Transactional(readOnly = true)
    public List<Report> getAllReports() {
        return reportRepository.findAllByOrderByCreatedAtDesc();
    }
}
