from sqlalchemy.types import TypeDecorator, String
from cryptography.fernet import Fernet
import os

class EncryptedString(TypeDecorator):
    """
    SQLAlchemy TypeDecorator that encrypts data before saving and decrypts on retrieval.
    """
    impl = String
    
    # 32 bytes mock key for demo - in prod, use os.getenv("ENCRYPTION_KEY")
    # For a real implementation, you MUST generate this once and store it safely.
    # Fernet.generate_key()
    DEFAULT_KEY = b'w_PDBH_6q9L_1I8v7X2k-5Z0n3o6r9y2u5i8o1p4a7s=' 

    def __init__(self, key=None):
        super().__init__()
        self._key = key or os.getenv("DB_ENCRYPTION_KEY", self.DEFAULT_KEY)
        # Ensure key is bytes
        if isinstance(self._key, str):
            self._key = self._key.encode()
        self.fernet = Fernet(self._key)

    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        # Encrypt
        if isinstance(value, str):
            value = value.encode('utf-8')
        return self.fernet.encrypt(value).decode('utf-8')

    def process_result_value(self, value, dialect):
        if value is None:
            return None
        # Decrypt
        if isinstance(value, str):
            value = value.encode('utf-8')
        return self.fernet.decrypt(value).decode('utf-8')
