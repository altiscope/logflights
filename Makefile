test: FORCE
	python manage.py test --exclude-tag=api_key

test-all: FORCE
	python manage.py test

test-fast: FORCE
	python manage.py test --exclude-tag=slow --exclude-tag=api_key

FORCE:
