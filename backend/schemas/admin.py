from pydantic import BaseModel, EmailStr

class CreateHRSchema(BaseModel):
    full_name: str
    email: EmailStr
    year_of_joining: int

class CreateHRResponse(BaseModel):
    message: str
    hr_login_id: str
    temporary_password: str
