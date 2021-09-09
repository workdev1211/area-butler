import { useAuth0 } from "@auth0/auth0-react";
import { AxiosResponse } from "axios";
import axios from "axios";

const headers = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

export const useHttp = () => {
  const { getIdTokenClaims } = useAuth0();
  const baseUrl = process.env.REACT_APP_BASE_URL || "";

  const get = async <T>(url: string, body: any): Promise<AxiosResponse<T>> => {
    const { __raw } = await getIdTokenClaims();
    const authorization = `Bearer ${__raw}`;

    return axios.get<T>(`${baseUrl}${url}`, {
      headers: {
        ...headers,
        Authorization: authorization,
      },
    });
  };

  const post = async <T>(url: string, body: any): Promise<AxiosResponse<T>> => {
    const { __raw } = await getIdTokenClaims();
    const authorization = `Bearer ${__raw}`;

    return axios.post(`${baseUrl}${url}`, body, {
      headers: {
        ...headers,
        Authorization: authorization,
      },
    });
  };

  const put = async <T>(url: string, body: any): Promise<AxiosResponse<T>> => {
    const { __raw } = await getIdTokenClaims();
    const authorization = `Bearer ${__raw}`;
    return axios.put(`${baseUrl}${url}`, body, {
      headers: {
        ...headers,
        Authorization: authorization,
      },
    });
  };

  const deleteRequest = async <T>(url: string): Promise<AxiosResponse<T>> => {
    const { __raw } = await getIdTokenClaims();
    const authorization = `Bearer ${__raw}`;
    return axios.delete(`${baseUrl}${url}`, {
      headers: {
        ...headers,
        Authorization: authorization,
      },
    });
  };

  return { get, post, put, deleteRequest };
};
