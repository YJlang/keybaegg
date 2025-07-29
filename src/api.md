📘 API 명세서: 사용자(User) 관리

1. POST /api/users
   설명: 새로운 사용자 등록
   요청 바디:
    - name: String (예: "홍길동")
    - email: String (예: "gildong@example.com")
      응답:
    - id: Long
    - name: String
    - email: String

2. GET /api/users/{id}
   설명: ID로 사용자 조회
   응답:
    - id: Long
    - name: String
    - email: String

3. GET /api/users/email/{email}
   설명: 이메일로 사용자 조회
   응답:
    - id: Long
    - name: String
    - email: String

4. GET /api/users
   설명: 모든 사용자 목록 조회
   응답:
    - List<User>
