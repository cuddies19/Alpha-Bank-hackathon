from __future__ import annotations

import pytest
from pydantic import ValidationError

from app.config import DEFAULT_JWT_SECRET, Settings


def test_prod_requires_explicit_jwt_secret():
    with pytest.raises(ValidationError):
        Settings(app_env="prod", jwt_secret=DEFAULT_JWT_SECRET, _env_file=None)


def test_prod_accepts_explicit_jwt_secret():
    secret = "x" * 32
    settings = Settings(app_env="prod", jwt_secret=secret, _env_file=None)
    assert settings.jwt_secret == secret
