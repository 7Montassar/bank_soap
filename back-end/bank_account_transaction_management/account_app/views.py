from spyne.service import ServiceBase
from spyne.protocol.soap import Soap11
from .complexTypes import Account, Client, Transaction
from spyne import Unicode, rpc, Application
from spyne.model.complex import Iterable
from .models import Account as DjangoAccount, Client as DjangoClient, Transaction as DjangoTransaction, TransactionType
from spyne.server.django import DjangoApplication
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse

class AccountService(ServiceBase):
    @rpc(Client, _returns=Unicode)
    def add_client(self, client: Client):
      client, created_clt = DjangoClient.objects.get_or_create(
        cin = client.cin,
        defaults={
          'name': client.name,
          'familyName': client.familyName,
          'email': client.email,
        }
      )
      if not created_clt:
        return f"Client with CIN {client.cin} already exists"
      return f"Client {client.cin} added successfully"
    
    
    @rpc(Account, _returns=Unicode)
    def add_account(self, account: Account):
      client, _ = DjangoClient.objects.get_or_create(
        cin = account.client.cin,
        defaults={
          'name': account.client.name,
          'familyName': account.client.familyName,
          'email': account.client.email,
        }
      )  
      _, created_acc = DjangoAccount.objects.get_or_create(
        rib = account.rib,
        defaults={
          'client': client,
          'balance': account.balance,
        }
      )
      if not created_acc:
        return f"Account {account.rib} already exists"
      return f"Account {account.rib} added successfully"
    
    
    @rpc(Unicode, _returns=Account)
    def get_account_details(self, email: str) -> Account:
      dj_account = DjangoAccount.objects.filter(client__email__iexact=email).first() 
      if dj_account is None:
        raise ValueError(f"Account {email} does not exist")
      account = Account()
      account.rib = dj_account.rib
      account.balance = dj_account.balance
      account.balance = dj_account.balance
      account.creationDate = dj_account.creation_date
      return account
    
    @rpc(_returns=Iterable(Account))
    def get_all_accounts(self):
      accounts = DjangoAccount.objects.all()
      for dj_account in accounts:
        account = Account(
          rib=dj_account.rib,
          client=dj_account.client,
          balance=dj_account.balance,
          creationDate=dj_account.creation_date
        )
        yield account
        
    
    @rpc(Transaction, _returns=Unicode)
    def deposit(self, transaction: Transaction):
      if transaction.TransactionType != TransactionType.DEPOSIT:
        return f"Transaction type must be deposit"
      if transaction.amount <= 0:
        return f"Amount must be greater than 0"
      client, _ = DjangoClient.objects.get_or_create(
        cin = transaction.account.client.cin,
        defaults={
          'name': transaction.account.client.name,
          'familyName': transaction.account.client.familyName,
          'email': transaction.account.client.email,
        }
      )
      account, _ = DjangoAccount.objects.get_or_create(
        rib = transaction.account.rib,
        defaults={
          'client': client,
          'balance': transaction.account.balance,
        }
      )
      DjangoTransaction.objects.create(
        amount = transaction.amount,
        transactionType = transaction.TransactionType,
        account = account,
      )
      account.balance += transaction.amount
      account.save()
      return f"Deposit of {transaction.amount} for {transaction.account.rib} successful"
    
    
    @rpc(Transaction, _returns=Unicode)
    def withdraw(self, transaction: Transaction):
      if transaction.TransactionType != TransactionType.WITHDRAW:
        return f"Transaction type must be withdraw"
      client, _ = DjangoClient.objects.get_or_create(
        cin = transaction.account.client.cin,
        defaults={
          'name': transaction.account.client.name,
          'familyName': transaction.account.client.familyName,
          'email': transaction.account.client.email,
        }
      )
      account, _ = DjangoAccount.objects.get_or_create(
        rib = transaction.account.rib,
        defaults={
          'client': client,
          'balance': transaction.account.balance,
        }
      )
      if transaction.amount > account.balance:
        return f"Amount must be greater than 0"
      DjangoTransaction.objects.create(
        amount = transaction.amount,
        transactionType = transaction.TransactionType,
        account = account,
      )
      account.balance -= transaction.amount
      account.save()
      return f"Withdraw of {transaction.amount} for {transaction.account.rib} successful"
    @rpc(Transaction, _returns=Unicode)
    def transfer(self, transaction: Transaction):
      if transaction.TransactionType != TransactionType.TRANSFER:
        return f"Transaction type must be transfer"
      if transaction.amount <= 0:
        return f"Amount must be greater than 0"
      client, _ = DjangoClient.objects.get_or_create(
        cin = transaction.account.client.cin,
        defaults={
          'name': transaction.account.client.name,
          'familyName': transaction.account.client.familyName,
          'email': transaction.account.client.email,
        }
      )
      account, _ = DjangoAccount.objects.get_or_create(
        rib = transaction.account.rib,
        defaults={
          'client': client,
          'balance': transaction.account.balance,
        }
      )
      account_dest = DjangoAccount.objects.get(
        rib = transaction.transfer_to_acount
      )
      if account_dest is None:
        return f"Account {transaction.account_dest.rib} does not exist"
      DjangoTransaction.objects.create(
        amount = transaction.amount,
        transactionType = transaction.TransactionType,
        account = account,
        transfer_to_account = account_dest.rib,
        
      )
      account.balance -= transaction.amount
      account_dest.balance += transaction.amount
      account.save()
      account_dest.save()
      return f"Transfer of {transaction.amount} for {transaction.account.rib} to {transaction.transfer_to_acount} successful"
      
      
application = Application([AccountService],
                            tns='bank.soap',
                            in_protocol=Soap11(validator='lxml'),
                            out_protocol=Soap11(validator='lxml')                      
                            ) 
django_app = DjangoApplication(application)
soap_app = csrf_exempt(django_app)

@csrf_exempt
def soap_service(request):
  return HttpResponse(soap_app(request))