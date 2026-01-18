from django.db import models
from projects.models import Project


class Task(models.Model):
    TASK_STATUS_CHOICES = (
        ("TODO", "Todo"),
        ("IN_PROGRESS", "In Progress"),
        ("DONE", "Done"),
    )

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="tasks"
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)

    status = models.CharField(
        max_length=20,
        choices=TASK_STATUS_CHOICES,
        default="TODO"
    )
    assignee_email = models.EmailField(blank=True)
    due_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.status})"


class TaskComment(models.Model):
    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name="comments"
    )
    content = models.TextField()
    author_email = models.EmailField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.content[:30]
