package com.stemadeleine.api.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
public class SupabaseStorageClient {

    @Value("${SUPABASE_URL:http://localhost}")
    private String supabaseUrl;

    @Value("${SUPABASE_SERVICE_KEY:fake-key}")
    private String supabaseKey;

    private final HttpClient client = HttpClient.newHttpClient();

    public String getPublicUrl(String bucket, String key) {
        return String.format("%s/storage/v1/object/public/%s/%s", supabaseUrl, bucket, key);
    }

    public void uploadFile(String bucket, String key, InputStream fileStream, long size, String contentType) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(supabaseUrl + "/storage/v1/object/" + bucket + "/" + key))
                .header("Authorization", "Bearer " + supabaseKey)
                .header("Content-Type", contentType)
                .PUT(HttpRequest.BodyPublishers.ofInputStream(() -> fileStream))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() >= 400) {
            throw new IOException("Erreur upload Supabase : " + response.body());
        }
    }

    public InputStream downloadFile(String bucket, String key) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(supabaseUrl + "/storage/v1/object/public/" + bucket + "/" + key))
                .header("Authorization", "Bearer " + supabaseKey)
                .build();

        HttpResponse<InputStream> response = client.send(request, HttpResponse.BodyHandlers.ofInputStream());

        if (response.statusCode() != 200) {
            throw new IOException("Impossible de télécharger le fichier, code: " + response.statusCode());
        }

        return response.body();
    }
}
