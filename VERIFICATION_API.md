# Verification API Endpoints

All endpoints require authentication via JWT token in the Authorization header.

## Base URL

```
http://localhost:3000/api/verification
```

---

## 1. Upload Certificate for Verification

**Endpoint:** `POST /verification/upload`

**Description:** Upload a certificate file for AI verification

**Authentication:** Required (JWT)

**Request:**

- Content-Type: `multipart/form-data`
- Body:
  - `file`: File (Required) - Certificate file (JPG, PNG, or PDF, max 10MB)
  - `certificateType`: String (Required) - One of: WASSCE, JAMB, NECO, JUPEB, ICAN, OTHER

**Response:**

```json
{
  "success": true,
  "message": "Certificate uploaded successfully",
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "certificateType": "WASSCE",
    "fileName": "certificate.pdf",
    "fileUrl": "uploads/1234567890-123456789.pdf",
    "fileSize": 1024000,
    "fileMimeType": "application/pdf",
    "status": "PENDING",
    "confidenceScore": null,
    "analysisResult": null,
    "errorMessage": null,
    "processingTime": null,
    "createdAt": "2025-12-14T17:00:00.000Z",
    "updatedAt": "2025-12-14T17:00:00.000Z"
  }
}
```

---

## 2. Get Dashboard Statistics

**Endpoint:** `GET /verification/dashboard/stats`

**Description:** Get statistics for the dashboard overview

**Authentication:** Required (JWT)

**Response:**

```json
{
  "success": true,
  "message": "Dashboard statistics retrieved successfully",
  "data": {
    "totalVerified": 1247,
    "authentic": 876,
    "suspicious": 120,
    "forged": 120,
    "pending": 131,
    "recentVerifications": [
      {
        "id": "uuid",
        "certificateType": "WASSCE",
        "fileName": "certificate.pdf",
        "status": "AUTHENTIC",
        "confidenceScore": 92.5,
        "createdAt": "2025-12-14T17:00:00.000Z"
      }
    ]
  }
}
```

---

## 3. Get Verification History

**Endpoint:** `GET /verification/history`

**Description:** Get paginated verification history

**Authentication:** Required (JWT)

**Query Parameters:**

- `page` (optional, default: 1) - Page number
- `pageSize` (optional, default: 10) - Items per page

**Response:**

```json
{
  "success": true,
  "message": "Verification history retrieved successfully",
  "data": {
    "verifications": [
      {
        "id": "uuid",
        "userId": "uuid",
        "certificateType": "WASSCE",
        "fileName": "certificate.pdf",
        "fileUrl": "uploads/1234567890-123456789.pdf",
        "fileSize": 1024000,
        "fileMimeType": "application/pdf",
        "status": "AUTHENTIC",
        "confidenceScore": 92.5,
        "analysisResult": {
          "confidence": 92.5,
          "authenticity": "AUTHENTIC",
          "details": {
            "textRecognition": "Successful",
            "signatureDetection": "Valid",
            "watermarkVerification": "Present",
            "templateMatching": "92% match"
          }
        },
        "errorMessage": null,
        "processingTime": 3245,
        "createdAt": "2025-12-14T17:00:00.000Z",
        "updatedAt": "2025-12-14T17:00:03.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

---

## 4. Get Verification by ID

**Endpoint:** `GET /verification/:id`

**Description:** Get detailed verification result by ID

**Authentication:** Required (JWT)

**URL Parameters:**

- `id` (required) - Verification ID (UUID)

**Response:**

```json
{
  "success": true,
  "message": "Verification retrieved successfully",
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "certificateType": "WASSCE",
    "fileName": "certificate.pdf",
    "fileUrl": "uploads/1234567890-123456789.pdf",
    "fileSize": 1024000,
    "fileMimeType": "application/pdf",
    "status": "AUTHENTIC",
    "confidenceScore": 92.5,
    "analysisResult": {
      "confidence": 92.5,
      "authenticity": "AUTHENTIC",
      "details": {
        "textRecognition": "Successful",
        "signatureDetection": "Valid",
        "watermarkVerification": "Present",
        "templateMatching": "92% match"
      },
      "timestamp": "2025-12-14T17:00:03.000Z"
    },
    "errorMessage": null,
    "processingTime": 3245,
    "createdAt": "2025-12-14T17:00:00.000Z",
    "updatedAt": "2025-12-14T17:00:03.000Z"
  }
}
```

---

## 5. Delete Verification

**Endpoint:** `DELETE /verification/:id`

**Description:** Delete a verification record and associated file

**Authentication:** Required (JWT)

**URL Parameters:**

- `id` (required) - Verification ID (UUID)

**Response:**

```json
{
  "success": true,
  "message": "Verification deleted successfully",
  "data": null
}
```

---

## Verification Status Flow

1. **PENDING** - File uploaded, awaiting processing
2. **PROCESSING** - AI analysis in progress
3. **AUTHENTIC** - Certificate verified as authentic (confidence >= 80%)
4. **SUSPICIOUS** - Certificate shows suspicious patterns (50% <= confidence < 80%)
5. **FORGED** - Certificate detected as forged (confidence < 50%)

---

## Certificate Types

- `WASSCE` - West African Senior School Certificate Examination
- `JAMB` - Joint Admissions and Matriculation Board
- `NECO` - National Examinations Council
- `JUPEB` - Joint Universities Preliminary Examinations Board
- `ICAN` - Institute of Chartered Accountants of Nigeria
- `OTHER` - Other certificate types

---

## Error Responses

**400 Bad Request:**

```json
{
  "success": false,
  "message": "Invalid file type. Only JPG, PNG, and PDF are allowed.",
  "data": null
}
```

**401 Unauthorized:**

```json
{
  "success": false,
  "message": "Unauthorized",
  "data": null
}
```

**404 Not Found:**

```json
{
  "success": false,
  "message": "Verification not found",
  "data": null
}
```

**500 Internal Server Error:**

```json
{
  "success": false,
  "message": "Internal server error",
  "data": null
}
```
