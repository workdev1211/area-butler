import { useContext } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

import { UserContext } from "../context/UserContext";

interface IRequestHeaders {
  Accept: string;
  "Content-Type": string;
  Authorization?: string;
}

const defaultHeaders: IRequestHeaders = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

const baseUrl = process.env.REACT_APP_BASE_URL || "";

export const useHttp = () => {
  const {
    userState: { integrationUser },
  } = useContext(UserContext);

  const { isLoading, getIdTokenClaims } = useAuth0();

  const defaultConfig = { maxContentLength: 20971520, maxBodyLength: 20971520 };

  const getRequestHeaders = async (
    additionalHeaders: { [key: string]: string } = {}
  ): Promise<IRequestHeaders> => {
    const requestHeaders: IRequestHeaders = {
      ...defaultHeaders,
      ...additionalHeaders,
    };

    const idToken = !isLoading && (await getIdTokenClaims());

    // there could be a request without authorization, e.g. the routing one
    if (idToken && !integrationUser) {
      requestHeaders["Authorization"] = `Bearer ${idToken.__raw}`;
    }

    if (integrationUser) {
      requestHeaders[
        "Authorization"
      ] = `AccessToken ${integrationUser.accessToken}`;
    }

    return requestHeaders;
  };

  const post = async <T, U = unknown>(
    url: string,
    body?: U,
    additionalHeaders: { [key: string]: string } = {},
    axiosRequestConfig: AxiosRequestConfig = {}
  ): Promise<AxiosResponse<T>> => {
    const headers = await getRequestHeaders(additionalHeaders);

    return axios.post(`${baseUrl}${url}`, body, {
      ...defaultConfig,
      ...axiosRequestConfig,
      headers,
    });
  };

  const get = async <T>(
    url: string,
    additionalHeaders: { [key: string]: string } = {},
    axiosRequestConfig: AxiosRequestConfig = {}
  ): Promise<AxiosResponse<T>> => {
    const headers = await getRequestHeaders(additionalHeaders);

    return axios.get<T>(`${baseUrl}${url}`, {
      ...defaultConfig,
      ...axiosRequestConfig,
      headers,
    });
  };

  const put = async <T, U = unknown>(
    url: string,
    body: U,
    additionalHeaders: { [key: string]: string } = {},
    axiosRequestConfig: AxiosRequestConfig = {}
  ): Promise<AxiosResponse<T>> => {
    const headers = await getRequestHeaders(additionalHeaders);

    return axios.put(`${baseUrl}${url}`, body, {
      ...defaultConfig,
      ...axiosRequestConfig,
      headers,
    });
  };

  const patch = async <T, U = unknown>(
    url: string,
    body: U,
    additionalHeaders: { [key: string]: string } = {},
    axiosRequestConfig: AxiosRequestConfig = {}
  ): Promise<AxiosResponse<T>> => {
    const headers = await getRequestHeaders(additionalHeaders);

    return axios.patch(`${baseUrl}${url}`, body, {
      ...defaultConfig,
      ...axiosRequestConfig,
      headers,
    });
  };

  const deleteRequest = async <T>(
    url: string,
    additionalHeaders: { [key: string]: string } = {},
    axiosRequestConfig: AxiosRequestConfig = {}
  ): Promise<AxiosResponse<T>> => {
    const headers = await getRequestHeaders(additionalHeaders);
    return axios.delete(`${baseUrl}${url}`, { ...axiosRequestConfig, headers });
  };

  return { post, get, put, patch, deleteRequest };
};
