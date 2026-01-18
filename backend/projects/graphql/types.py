import graphene
from graphene_django import DjangoObjectType

from projects.models import Organization, Project
from tasks.models import Task, TaskComment


class OrganizationType(DjangoObjectType):
    class Meta:
        model = Organization
        fields = "__all__"


class ProjectType(DjangoObjectType):
    class Meta:
        model = Project
        fields = "__all__"


class TaskType(DjangoObjectType):
    class Meta:
        model = Task
        fields = "__all__"


class CommentType(DjangoObjectType):
    class Meta:
        model = TaskComment
        fields = "__all__"
