package com.processserve.order.service;

import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.poi.hwpf.HWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

@Service
@Slf4j
public class DocumentPageCounter {

    /**
     * Count pages in a document based on file extension
     * Supports PDF, DOC, DOCX formats
     * Returns 0 for unsupported formats or if counting fails
     */
    public int countPages(File file) {
        String filename = file.getName().toLowerCase();
        
        try {
            if (filename.endsWith(".pdf")) {
                return countPdfPages(file);
            } else if (filename.endsWith(".docx")) {
                return countDocxPages(file);
            } else if (filename.endsWith(".doc")) {
                return countDocPages(file);
            } else {
                log.info("File format not supported for page counting: {}", filename);
                return 0; // Unsupported format (images, etc.)
            }
        } catch (Exception e) {
            log.error("Error counting pages for file: {}", filename, e);
            return 0;
        }
    }

    /**
     * Count pages in a PDF document
     */
    private int countPdfPages(File file) throws IOException {
        try (PDDocument document = PDDocument.load(file)) {
            int pageCount = document.getNumberOfPages();
            log.info("PDF page count: {} for file: {}", pageCount, file.getName());
            return pageCount;
        }
    }

    /**
     * Count pages in a DOCX document
     * Note: This is an approximation based on page breaks
     */
    private int countDocxPages(File file) throws IOException {
        try (FileInputStream fis = new FileInputStream(file);
             XWPFDocument document = new XWPFDocument(fis)) {
            
            // DOCX doesn't store page count directly
            // We estimate based on content: ~500 words per page
            int totalWords = 0;
            for (var paragraph : document.getParagraphs()) {
                String text = paragraph.getText();
                if (text != null && !text.trim().isEmpty()) {
                    totalWords += text.split("\\s+").length;
                }
            }
            
            // Rough estimate: 500 words per page
            int estimatedPages = Math.max(1, (int) Math.ceil(totalWords / 500.0));
            log.info("DOCX estimated page count: {} (based on {} words) for file: {}", 
                    estimatedPages, totalWords, file.getName());
            return estimatedPages;
        }
    }

    /**
     * Count pages in a DOC document
     * Note: This is an approximation
     */
    private int countDocPages(File file) throws IOException {
        try (FileInputStream fis = new FileInputStream(file);
             HWPFDocument document = new HWPFDocument(fis)) {
            
            // Similar to DOCX, we estimate based on text content
            String fullText = document.getDocumentText();
            int wordCount = fullText.split("\\s+").length;
            
            // Rough estimate: 500 words per page
            int estimatedPages = Math.max(1, (int) Math.ceil(wordCount / 500.0));
            log.info("DOC estimated page count: {} (based on {} words) for file: {}", 
                    estimatedPages, wordCount, file.getName());
            return estimatedPages;
        }
    }

    /**
     * Count pages from InputStream (for immediate processing during upload)
     */
    public int countPages(InputStream inputStream, String filename) throws IOException {
        filename = filename.toLowerCase();
        
        if (filename.endsWith(".pdf")) {
            try (PDDocument document = PDDocument.load(inputStream)) {
                return document.getNumberOfPages();
            }
        } else if (filename.endsWith(".docx")) {
            try (XWPFDocument document = new XWPFDocument(inputStream)) {
                int totalWords = 0;
                for (var paragraph : document.getParagraphs()) {
                    String text = paragraph.getText();
                    if (text != null && !text.trim().isEmpty()) {
                        totalWords += text.split("\\s+").length;
                    }
                }
                return Math.max(1, (int) Math.ceil(totalWords / 500.0));
            }
        } else if (filename.endsWith(".doc")) {
            try (HWPFDocument document = new HWPFDocument(inputStream)) {
                String fullText = document.getDocumentText();
                int wordCount = fullText.split("\\s+").length;
                return Math.max(1, (int) Math.ceil(wordCount / 500.0));
            }
        }
        
        return 0; // Unsupported format
    }
}
