"""
Django management command wrapper for the seed data script.

Usage:
    python manage.py seed
    python manage.py seed --no-input   (skip confirmation prompt)
"""

from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Populate the database with realistic seed data for development."

    def add_arguments(self, parser):
        parser.add_argument(
            "--no-input",
            action="store_true",
            dest="no_input",
            help="Skip the confirmation prompt.",
        )

    def handle(self, *args, **options):
        if not options["no_input"]:
            confirm = input(
                "This will add seed data to the database. "
                "Safe to run on an empty or existing DB (idempotent). Continue? [y/N] "
            )
            if confirm.strip().lower() not in ("y", "yes"):
                self.stdout.write(self.style.WARNING("Aborted."))
                return

        from seeds.seed_data import run
        run()

        self.stdout.write(self.style.SUCCESS("Seed complete!"))
