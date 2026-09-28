import graphene
from graphene_sqlalchemy import SQLAlchemyObjectType
from app.models import Pago

class PagoType(SQLAlchemyObjectType):
    class Meta:
        model = Pago
        interfaces = (graphene.relay.Node, )
    
    id = graphene.ID(required=True)
    monto = graphene.Float(required=True)
    metodo = graphene.String(required=True)
    estado = graphene.String(required=True)
    referencia = graphene.String()
    orden_id = graphene.ID(required=True)
    creado_en = graphene.String(required=True)
    actualizado_en = graphene.String(required=True)

class Query(graphene.ObjectType):
    pagos = graphene.List(PagoType, orden_id=graphene.ID())
    pago = graphene.Field(PagoType, id=graphene.ID(required=True))
    
    def resolve_pagos(self, info, orden_id=None):
        query = PagoType.get_query(info)
        if orden_id:
            query = query.filter(Pago.orden_id == orden_id)
        return query.all()
    
    def resolve_pago(self, info, id):
        query = PagoType.get_query(info)
        return query.filter(Pago.id == id).first()

class CrearPagoInput(graphene.InputObjectType):
    monto = graphene.Float(required=True)
    metodo = graphene.String(required=True)
    referencia = graphene.String()
    orden_id = graphene.ID(required=True)

class CrearPago(graphene.Mutation):
    class Arguments:
        input = CrearPagoInput(required=True)
    
    pago = graphene.Field(PagoType)
    
    def mutate(self, info, input):
        from app.models import Pago
        pago = Pago(
            monto=input.monto,
            metodo=input.metodo,
            estado='PENDIENTE',
            referencia=input.referencia,
            orden_id=input.orden_id
        )
        from app import db
        db.session.add(pago)
        db.session.commit()
        return CrearPago(pago=pago)

class ActualizarPagoInput(graphene.InputObjectType):
    monto = graphene.Float()
    metodo = graphene.String()
    estado = graphene.String()
    referencia = graphene.String()

class ActualizarPago(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        input = ActualizarPagoInput(required=True)
    
    pago = graphene.Field(PagoType)
    
    def mutate(self, info, id, input):
        from app.models import Pago
        from app import db
        pago = Pago.query.get(id)
        if not pago:
            raise Exception(f"Pago no encontrado: {id}")
        
        if input.monto is not None:
            pago.monto = input.monto
        if input.metodo is not None:
            pago.metodo = input.metodo
        if input.estado is not None:
            pago.estado = input.estado
        if input.referencia is not None:
            pago.referencia = input.referencia
        
        db.session.commit()
        return ActualizarPago(pago=pago)

class EliminarPago(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
    
    success = graphene.Boolean()
    
    def mutate(self, info, id):
        from app.models import Pago
        from app import db
        pago = Pago.query.get(id)
        if not pago:
            return EliminarPago(success=False)
        db.session.delete(pago)
        db.session.commit()
        return EliminarPago(success=True)

class Mutation(graphene.ObjectType):
    crear_pago = CrearPago.Field()
    actualizar_pago = ActualizarPago.Field()
    eliminar_pago = EliminarPago.Field()

schema = graphene.Schema(query=Query, mutation=Mutation)
