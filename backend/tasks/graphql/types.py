import graphene
from graphene_django import DjangoObjectType
from tasks.models import Task, TaskComment
from projects.graphql.types import ProjectType


class TaskType(DjangoObjectType):
    project = graphene.Field(ProjectType)

    class Meta:
        model = Task
        fields = "__all__"


class TaskCommentType(DjangoObjectType):
    task = graphene.Field(TaskType)

    class Meta:
        model = TaskComment
        fields = "__all__"
