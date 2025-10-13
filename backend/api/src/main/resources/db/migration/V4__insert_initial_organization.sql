INSERT INTO organizations (id,
                           name,
                           description,
                           slug,
                           primary_color,
                           secondary_color,
                           creation_date,
                           created_at,
                           updated_at)
VALUES ('11111111-1111-1111-1111-111111111111',
        'Exemple Organisation',
        'Organisation insérée par la migration V4',
        'exemple-organisation',
        '#90cab4',
        '#e2832b',
        CURRENT_DATE,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP);

