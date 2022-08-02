import { useAuth0 } from "@auth0/auth0-react";
import { AxiosResponse } from "axios";
import axios from "axios";

const defaultHeaders = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

export const useHttp = () => {
  const { getIdTokenClaims } = useAuth0();
  const baseUrl = process.env.REACT_APP_BASE_URL || "";

  const get = async <T>(url: string): Promise<AxiosResponse<T>> => {
    const headers: any = { ...defaultHeaders };
    const idToken = await getIdTokenClaims();

    if (!!idToken) {
      const { __raw } = await getIdTokenClaims();
      const authorization = `Bearer ${__raw}`;
      headers["Authorization"] = authorization;
    }

    return axios.get<T>(`${baseUrl}${url}`, {
      headers,
    });
  };

  const post = async <T>(
    url: string,
    body: any,
    requestHeaders = {}
  ): Promise<AxiosResponse<T>> => {
    const headers: any = { ...defaultHeaders, ...requestHeaders };
    const idToken = await getIdTokenClaims();

    if (idToken) {
      const { __raw } = await getIdTokenClaims();
      headers["Authorization"] = `Bearer ${__raw}`;
    }

    return axios.post(`${baseUrl}${url}`, body, {
      headers,
    });
  };

  const put = async <T>(url: string, body: any): Promise<AxiosResponse<T>> => {
    const headers: any = { ...defaultHeaders };
    const idToken = await getIdTokenClaims();

    if (!!idToken) {
      const { __raw } = await getIdTokenClaims();
      const authorization = `Bearer ${__raw}`;
      headers["Authorization"] = authorization;
    }
    return axios.put(`${baseUrl}${url}`, body, {
      headers,
    });
  };

  const deleteRequest = async <T>(url: string): Promise<AxiosResponse<T>> => {
    const headers: any = { ...defaultHeaders };
    const idToken = await getIdTokenClaims();

    if (!!idToken) {
      const { __raw } = await getIdTokenClaims();
      const authorization = `Bearer ${__raw}`;
      headers["Authorization"] = authorization;
    }
    return axios.delete(`${baseUrl}${url}`, {
      headers,
    });
  };

  return { get, post, put, deleteRequest };
};
