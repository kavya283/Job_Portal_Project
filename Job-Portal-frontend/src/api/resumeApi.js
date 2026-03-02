import api from "./axios";

export const downloadResume = async () => {
  const res = await api.get("/resume/download", {
    responseType: "blob"
  });

  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "resume.pdf");
  document.body.appendChild(link);
  link.click();
};
