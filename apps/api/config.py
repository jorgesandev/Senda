from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    google_maps_api_key: str = ""
    streetview_api_key: str = ""
    vertex_project_id: str = ""
    vertex_location: str = ""
    firebase_project_id: str = ""
    firebase_credentials_json: str = ""
    gemini_api_key: str = ""
    valhalla_url: str = "http://localhost:8002"
    vision_backend: Literal["gemini", "self_hosted_vlm"] = "gemini"
    vlm_endpoint: str = ""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
