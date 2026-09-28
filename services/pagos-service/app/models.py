from datetime import datetime
from app import db
import uuid

class Pago(db.Model):
    __tablename__ = 'pagos'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    monto = db.Column(db.Float, nullable=False)
    metodo = db.Column(db.String(20), nullable=False)
    estado = db.Column(db.String(20), nullable=False, default='PENDIENTE')
    referencia = db.Column(db.String(100), nullable=True)
    orden_id = db.Column(db.String(36), nullable=False)
    creado_en = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    actualizado_en = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'monto': self.monto,
            'metodo': self.metodo,
            'estado': self.estado,
            'referencia': self.referencia,
            'orden_id': self.orden_id,
            'creado_en': self.creado_en.isoformat(),
            'actualizado_en': self.actualizado_en.isoformat()
        }
