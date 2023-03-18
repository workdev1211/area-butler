import { useAuth0 } from "@auth0/auth0-react";
import { AxiosResponse } from "axios";
import axios from "axios";
import { useContext } from "react";

import { UserContext } from "../context/UserContext";

const defaultHeaders = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

export const useHttp = () => {
  const { isLoading, getIdTokenClaims } = useAuth0();
  const {
    userState: { integrationUser },
  } = useContext(UserContext);
  const baseUrl = process.env.REACT_APP_BASE_URL || "";

  const get = async <T>(
    url: string,
    requestHeaders = {},
    options = {}
  ): Promise<AxiosResponse<T>> => {
    const headers: any = { ...defaultHeaders, ...requestHeaders };
    const idToken = !isLoading && (await getIdTokenClaims());

    if (idToken) {
      headers["Authorization"] = `Bearer ${idToken.__raw}`;
    }

    return axios.get<T>(`${baseUrl}${url}`, {
      ...options,
      headers,
    });
  };

  const post = async <T, U = unknown>(
    url: string,
    body: U,
    requestHeaders = {}
  ): Promise<AxiosResponse<T>> => {
    const headers: any = { ...defaultHeaders, ...requestHeaders };
    const idToken = !isLoading && (await getIdTokenClaims());

    if (idToken && !integrationUser) {
      headers["Authorization"] = `Bearer ${idToken.__raw}`;
    }

    if (integrationUser) {
      headers["Authorization"] = `AccessToken ${integrationUser.accessToken}`;
    }

    return axios.post(`${baseUrl}${url}`, body, {
      headers,
    });
  };

  const put = async <T, U = unknown>(
    url: string,
    body: U
  ): Promise<AxiosResponse<T>> => {
    const headers: any = { ...defaultHeaders };
    const idToken = !isLoading && (await getIdTokenClaims());

    if (idToken) {
      headers["Authorization"] = `Bearer ${idToken.__raw}`;
    }

    return axios.put(`${baseUrl}${url}`, body, {
      headers,
    });
  };

  const deleteRequest = async <T>(url: string): Promise<AxiosResponse<T>> => {
    const headers: any = { ...defaultHeaders };
    const idToken = !isLoading && (await getIdTokenClaims());

    if (idToken) {
      headers["Authorization"] = `Bearer ${idToken.__raw}`;
    }

    return axios.delete(`${baseUrl}${url}`, {
      headers,
    });
  };

  return { get, post, put, deleteRequest };
};
