> 종류별 폴더 분리보다 **함께 수정되는 파일끼리 가까이 두라**. 특히 도메인 단위 구조를 추천한다.

# 함께 수정되는 파일을 같은 디렉토리에 두기

## 왜 필요한가

컴포넌트/훅/유틸 종류별로만 나누면
특정 기능을 고칠 때 관련 파일을 찾기 어렵고,
삭제 시 찌꺼기 코드가 남기 쉽다.

## FixLog 규칙

- shared는 전역 재사용만
- domain 내부에는 그 도메인에서만 바뀌는 파일을 모은다
- feature는 사용자 행동 단위로 파일을 묶는다
- widget은 화면 섹션 단위로 묶는다

## 추천 구조

```txt
src/
  shared/
  domain/
    document/
      api/
      type/
      schema/
      lib/
      ui/
  features/
    document/
      rename-document/
      delete-document/
      upload-document/
  widgets/
    document/
      document-list-section/
      document-editor-header/
  pages/
    documents/
    document-detail/
```

### 판단 기준

문서를 삭제하는 기능을 바꿀 때

- API

- schema

- action hook

- button ui

- modal

이 함께 바뀐다면 가까이 둔다.
