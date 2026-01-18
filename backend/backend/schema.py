import graphene
from projects.graphql.queries import Query as ProjectQuery
from projects.graphql.mutations import Mutation as ProjectMutation

class Query(ProjectQuery, graphene.ObjectType):
    pass

class Mutation(ProjectMutation, graphene.ObjectType):
    pass

schema = graphene.Schema(query=Query, mutation=Mutation)
