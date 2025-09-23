from django.db import models
from django.conf import settings

class PTAssignment(models.Model):
    pt = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='assigned_members',
        limit_choices_to={'role': 'pt'}
    )
    member = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='assigned_pt',
        limit_choices_to={'role': 'member'}
    )
    start_date = models.DateField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('pt', 'member')

    def __str__(self):
        return f"{self.pt.username} is assigned to {self.member.username}"