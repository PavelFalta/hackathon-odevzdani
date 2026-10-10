from app.services.users import verify_user


def test_verify_user_accepts_demo() -> None:
    user = verify_user("demo", "demo123")
    assert user is not None
    assert user.username == "demo"
    assert user.role == "user"


def test_verify_user_accepts_admin() -> None:
    user = verify_user("admin", "admin123")
    assert user is not None
    assert user.role == "admin"


def test_verify_user_rejects_wrong_password() -> None:
    assert verify_user("demo", "wrong") is None
