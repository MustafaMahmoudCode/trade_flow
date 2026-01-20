{
    'name': "Trade Flow",

    'summary': "Manage clients and trading operations for import-export business",

    'description': """
Trade Flow is a module to manage an import-export company workflow.
It allows you to categorize partners as clients, view them in list, form, and kanban views,
and provides a clear menu structure to manage trading operations efficiently.
    """,
    'author': "My Company",
    'website': "https://www.yourcompany.com",
    'category': 'Uncategorized',
    'version': '0.1',
    'depends': ['base','mail'],
    'data': [
        'security/ir.model.access.csv',
        'security/security.xml',
        'data/data.xml',
        'views/menus.xml',
        'wizards/add_shipment.xml',
        'views/employee.xml',
        'views/templates.xml',
        'views/clients_views.xml',
        'views/shipping_views.xml',
        'views/shipping_kanban.xml',

    ],
    'assets': {
        'web.assets_backend': [
            'trade_flow/static/src/components/*/*.js',
            'trade_flow/static/src/components/*/*.xml',
            'trade_flow/static/src/components/*/*.scss'
        ]
    }
}

