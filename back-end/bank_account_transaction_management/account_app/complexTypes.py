from spyne import ComplexModel,Integer,Unicode, Double, Decimal, Date
class Client(ComplexModel):
    cin = Integer
    name=Unicode
    familyName=Unicode
    email=Unicode

class Account(ComplexModel):
    rib=Unicode
    client=Client
    balance=Decimal
    AccountType=Unicode
    creationDate=Date

class Transaction(ComplexModel):
    id=Integer
    TransactionType=Unicode
    account=Account
    transactionDate=Date
    amount=Decimal
    description=Unicode
    transfer_to_acount=Unicode