from odoo import models, fields, api
from odoo.exceptions import ValidationError

#======= Employee=================-->
class Employee(models.Model):
    _name = 'shipping.employee'
    _description = 'Employee'

    name = fields.Char(string='Name', required=True)
    job_title = fields.Char(string='Job Title')
    phone = fields.Char(string='Phone')
    email = fields.Char(string='Email')
    image_1920 = fields.Image(string='Image')
    user_id = fields.Many2one('res.users', required=True)



    #  Constraint
    _sql_constraints = [
        ('uniq_employee_name', 'UNIQUE(user_id)', 'This User is already linked to an Employee!')
    ]


# ===============================->
#======= client=================-->
class Client(models.Model):
    _name = 'shipping.client'
    _description = 'Client'

    name = fields.Char(string='Name', required=True)
    phone = fields.Char(string='Phone')
    email = fields.Char(string='Email')
    address = fields.Text(string='Address')
    image_1920= fields.Image(string='Image')

    shipment_ids = fields.One2many('shipping.shipment', 'client_id', string='Shipments')
    employee_id = fields.Many2one('shipping.employee', string='Handled By')
    my_shipments_ids = fields.One2many('shipping.shipment', 'client_id', string='My Shipments')

# =================shipment=================-->
class Shipment(models.Model):
    _name = 'shipping.shipment'
    _description = 'Shipment'
    _inherit = ['mail.thread', 'mail.activity.mixin']

    name = fields.Char(string='Shipment Reference', required=True, tracking=True ,readonly=True, default='New')
    client_id = fields.Many2one('shipping.client', string='Client', required=True)
    employee_id = fields.Many2one('shipping.employee', string='Handled By')

    shipment_date = fields.Date(string='Shipment Date', default=fields.Date.today)
    weight = fields.Float(string='Weight (kg)')
    notes = fields.Text(string='Notes')
    image_1920= fields.Image(string='Image')
    color = fields.Integer(string='Color')
    client_name = fields.Char(related='client_id.name', string='Client Name', readonly=True)
    shipment_type = fields.Selection([
        ('standard', 'Standard'),
        ('express', 'Express'),
    ], string='Shipment Type', default='standard')
    state = fields.Selection([
        ('pending', 'Pending'),
        ('in_transit', 'In Transit'),
        ('delivered', 'Delivered'),
        ('cancel', 'Cancelled'),
    ], string='Status', default='pending',tracking=True)

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if not vals.get('name'):
                vals['name'] = self.env['ir.sequence'].next_by_code('shipping.shipment') or 'New'
        return super().create(vals_list)

    # ===== Methods for buttons =====
    def action_pending(self):
        self.state = 'pending'
    def action_in_transit(self):
        self.state = 'in_transit'
    def action_delivered(self):
        self.state = 'delivered'
    def action_cancel(self):
        self.state = 'cancel'
# ==============================================================->


