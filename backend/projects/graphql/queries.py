import graphene
from projects.models import Organization, Project
from projects.graphql.types import OrganizationType, ProjectType

class Query(graphene.ObjectType):
    organizations = graphene.List(OrganizationType)
    projects = graphene.List(ProjectType)
    project = graphene.Field(ProjectType, id=graphene.ID(required=True))

    def resolve_organizations(self, info):
        return Organization.objects.all()

    def resolve_projects(self, info):
        return Project.objects.all()

    def resolve_project(self, info, id):
        return Project.objects.get(pk=id)
