from __future__ import annotations

from datetime import date

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.models import Company, CompanyType, Product, User, UserRole
from app.security import hash_password, verify_password

PRODUCTS = [
    {
        "code": "overdraft",
        "name": "Овердрафт",
        "description": "Короткие кассовые разрывы, когда деньги нужны на несколько дней.",
        "min_amount": 300_000,
        "max_amount": 20_000_000,
        "min_term_months": 6,
        "max_term_months": 12,
        "rate": 23.0,
        "requires_collateral": False,
        "decision_time": "от 5 минут",
        "features": ["Без залога", "Только для расчётного счёта", "Лимит возобновляемый"],
    },
    {
        "code": "credit",
        "name": "Кредит на любые цели",
        "description": "Закупка, оборудование, ремонт или другая задача бизнеса.",
        "min_amount": 300_000,
        "max_amount": 150_000_000,
        "min_term_months": 12,
        "max_term_months": 120,
        "rate": 21.5,
        "requires_collateral": False,
        "decision_time": "от 5 минут",
        "features": ["Без залога до 50 млн ₽", "Экспресс-решение", "График аннуитетный"],
    },
    {
        "code": "credit_line",
        "name": "Кредитная линия",
        "description": "Деньги под сезонные закупки и неравномерную выручку.",
        "min_amount": 500_000,
        "max_amount": 30_000_000,
        "min_term_months": 18,
        "max_term_months": 60,
        "rate": 21.5,
        "requires_collateral": False,
        "decision_time": "до 1 часа",
        "features": ["Выбираете сумму частями", "Проценты только на использованное", "Без залога"],
    },
]

COMPANIES = [
    {
        "inn": "7701234567",
        "ogrn": "1247700123456",
        "type": CompanyType.llc,
        "name": "ООО «Дом и уют»",
        "registration_date": date(2024, 6, 12),
        "okved": "47.91",
        "address": "Москва, ул. Тверская, 18, офис 4",
        "director": "Соколов Игорь Андреевич",
        "phone": "+7 916 123-45-12",
    },
    {
        "inn": "770212345678",
        "ogrn": "324770012345671",
        "type": CompanyType.sole_proprietor,
        "name": "ИП Белова А. С.",
        "registration_date": date(2023, 3, 20),
        "okved": "47.71",
        "address": "Москва, ул. Арбат, 12",
        "director": "Белова Анна Сергеевна",
        "phone": "+7 916 555-21-90",
    },
    {
        "inn": "7703345678",
        "ogrn": "1227700987654",
        "type": CompanyType.llc,
        "name": "ООО «Лён и Дуб»",
        "registration_date": date(2022, 2, 14),
        "okved": "46.42",
        "address": "Москва, Ленинградский пр-т, 36",
        "director": "Орлова Марина Викторовна",
        "phone": "+7 925 300-11-47",
    },
    {
        "inn": "770498765432",
        "ogrn": "323770045678901",
        "type": CompanyType.sole_proprietor,
        "name": "ИП Фомин С. В.",
        "registration_date": date(2023, 11, 2),
        "okved": "49.41",
        "address": "Москва, ул. Складочная, 1, стр. 18",
        "director": "Фомин Сергей Владимирович",
        "phone": "+7 903 777-33-12",
    },
]

USERS = [
    {
        "login": "igor.sokolov",
        "role": UserRole.client,
        "full_name": "Игорь Соколов",
        "inn": "7701234567",
    },
    {
        "login": "anna.belova",
        "role": UserRole.client,
        "full_name": "Анна Белова",
        "inn": "770212345678",
    },
    {
        "login": "marina.orlova",
        "role": UserRole.client,
        "full_name": "Марина Орлова",
        "inn": "7703345678",
    },
    {
        "login": "sergey.fomin",
        "role": UserRole.client,
        "full_name": "Сергей Фомин",
        "inn": "770498765432",
    },
    {
        "login": "olga.kravtsova",
        "role": UserRole.underwriter,
        "full_name": "Ольга Кравцова",
        "inn": None,
    },
]


def seed_demo_data(db: Session) -> None:
    settings = get_settings()
    companies_by_inn: dict[str, Company] = {}
    for payload in COMPANIES:
        company = db.scalar(select(Company).where(Company.inn == payload["inn"]))
        if company is None:
            company = Company(**payload)
            db.add(company)
            db.flush()
        else:
            for key, value in payload.items():
                setattr(company, key, value)
        companies_by_inn[company.inn] = company

    for payload in USERS:
        user = db.scalar(select(User).where(User.login == payload["login"]))
        company = companies_by_inn.get(payload["inn"]) if payload["inn"] else None
        if user is None:
            user = User(
                login=payload["login"],
                password_hash=hash_password(settings.demo_password),
                role=payload["role"],
                full_name=payload["full_name"],
                company_id=company.id if company else None,
            )
            db.add(user)
        else:
            user.role = payload["role"]
            user.full_name = payload["full_name"]
            user.company_id = company.id if company else None
            if not verify_password(settings.demo_password, user.password_hash):
                user.password_hash = hash_password(settings.demo_password)

    for payload in PRODUCTS:
        product = db.scalar(select(Product).where(Product.code == payload["code"]))
        if product is None:
            db.add(Product(**payload))
        else:
            for key, value in payload.items():
                setattr(product, key, value)

    db.commit()
