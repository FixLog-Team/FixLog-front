/** POST /api/images/upload 응답 result. */
export interface ImageUploadDto {
  imageId: string;
  /** 문서 blocks 에 저장할 조회 주소. 만료되지 않고 서버가 권한을 확인한다. */
  url: string;
  originalName: string | null;
  contentType: string | null;
  fileSize: number;
}
