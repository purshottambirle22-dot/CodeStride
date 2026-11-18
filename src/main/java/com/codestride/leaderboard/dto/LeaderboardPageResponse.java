package com.codestride.leaderboard.dto;
import java.util.List;


public class LeaderboardPageResponse {
    private List<LeaderboardResponse> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;

    public LeaderboardPageResponse(
            List<LeaderboardResponse> content,
            int page,
            int size,
            long totalElements,
            int totalPages
    ) {
        this.content = content;
        this.page = page;
        this.size = size;
        this.totalElements = totalElements;
        this.totalPages = totalPages;
    }

    public List<LeaderboardResponse> getContent() {
        return content;
    }

    public int getPage() {
        return page;
    }

    public int getSize() {
        return size;
    }

    public long getTotalElements() {
        return totalElements;
    }

    public int getTotalPages() {
        return totalPages;
    }
}
