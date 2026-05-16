import { api } from "./client";

export interface UploadResponse {
  filename: string;
  url: string;
  size_bytes: number;
}

export const uploadsApi = {
  image: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api
      .post<UploadResponse>("/uploads/image", form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },

  document: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api
      .post<UploadResponse>("/uploads/document", form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },
};
