package com.processserve.order.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * OrderDocument - Entity for storing multiple documents per order
 * Supports multiple document uploads with metadata like file size, page count, etc.
 */
@Entity
@Table(name = "order_documents")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderDocument {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    @JsonBackReference("order-documents")
    private Order order;

    @Column(name = "document_url", nullable = false, length = 512)
    private String documentUrl;

    @Column(name = "original_file_name", nullable = false, length = 255)
    private String originalFileName;

    @Column(name = "file_size")
    private Long fileSize; // File size in bytes

    @Column(name = "page_count")
    private Integer pageCount;

    @Column(name = "document_type", length = 50)
    private String documentType; // For categorization (e.g., "summons", "complaint", etc.)

    @CreationTimestamp
    @Column(name = "uploaded_at", nullable = false)
    private LocalDateTime uploadedAt;

    @Column(name = "display_order")
    private Integer displayOrder = 0;

    // Helper method to get file size in MB
    public Double getFileSizeInMB() {
        if (fileSize == null) return 0.0;
        return fileSize / (1024.0 * 1024.0);
    }
}
