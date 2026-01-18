import graphene

from projects.models import Organization, Project
from tasks.models import Task, TaskComment
from projects.graphql.types import ProjectType, TaskType, CommentType

# ----- PROJECT
class CreateProject(graphene.Mutation):
    class Arguments:
        organization_slug = graphene.String(required=True)
        name = graphene.String(required=True)
        description = graphene.String()
        status = graphene.String()

    project = graphene.Field(ProjectType)

    def mutate(self, info, organization_slug, name, description=None, status=None):
        try:
            org = Organization.objects.get(slug=organization_slug)
        except Organization.DoesNotExist:
            raise Exception("Organization not found")

        project = Project.objects.create(
            organization=org,
            name=name,
            description=description,
            status=status or "PLANNED",
        )
        return CreateProject(project=project)


# ----- TASK
class CreateTask(graphene.Mutation):
    class Arguments:
        project_id = graphene.ID(required=True)
        title = graphene.String(required=True)
        description = graphene.String()
        status = graphene.String()

    task = graphene.Field(TaskType)

    def mutate(self, info, project_id, title, description=None, status=None):
        try:
            project = Project.objects.get(id=project_id)
        except Project.DoesNotExist:
            raise Exception("Project not found")

        task = Task.objects.create(
            project=project,
            title=title,
            description=description,
            status=status or "TODO",
        )
        return CreateTask(task=task)


# ----- COMMENT
class CreateComment(graphene.Mutation):
    class Arguments:
        task_id = graphene.ID(required=True)
        content = graphene.String(required=True)

    comment = graphene.Field(CommentType)

    def mutate(self, info, task_id, content):
        try:
            task = Task.objects.get(pk=task_id)
        except Task.DoesNotExist:
            raise Exception("Task not found")

        comment = TaskComment.objects.create(
            task=task,
            content=content
        )
        return CreateComment(comment=comment)


class UpdateTaskStatus(graphene.Mutation):
    class Arguments:
        task_id = graphene.ID(required=True)
        status = graphene.String(required=True)

    task = graphene.Field(TaskType)

    def mutate(self, info, task_id, status):
        try:
            task = Task.objects.get(pk=task_id)
        except Task.DoesNotExist:
            raise Exception("Task not found")

        task.status = status
        task.save()

        return UpdateTaskStatus(task=task)
class DeleteComment(graphene.Mutation):
    class Arguments:
        comment_id = graphene.ID(required=True)

    success = graphene.Boolean()
    task_id = graphene.ID()

    def mutate(self, info, comment_id):
        try:
            comment = TaskComment.objects.get(pk=comment_id)
        except TaskComment.DoesNotExist:
            raise Exception("Comment not found")

        task_id = comment.task_id
        comment.delete()

        return DeleteComment(success=True, task_id=task_id)


class RenameProject(graphene.Mutation):
    class Arguments:
        project_id = graphene.ID(required=True)
        name = graphene.String(required=True)

    project = graphene.Field(ProjectType)

    def mutate(self, info, project_id, name):
        try:
            project = Project.objects.get(pk=project_id)
        except Project.DoesNotExist:
            raise Exception("Project not found")

        project.name = name
        project.save()

        return RenameProject(project=project)

# ----- REGISTER MUTATIONS
class Mutation(graphene.ObjectType):
    create_project = CreateProject.Field()
    create_task = CreateTask.Field()
    create_comment = CreateComment.Field()
    
    update_task_status = UpdateTaskStatus.Field()
    delete_comment = DeleteComment.Field()
    rename_project = RenameProject.Field()