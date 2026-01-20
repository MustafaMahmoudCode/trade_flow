from odoo import models, fields

class AddShipment(models.TransientModel):
    _name = 'shipping.add_shipment'
    _description = "Add Shipment Wizard"

    client_id = fields.Many2one('shipping.client', string="Client", required=True)
    notes = fields.Text(string="Notes")
    weight = fields.Float(string="Weight (kg)")
    shipment_date = fields.Date(string="Date", default=fields.Date.today)
    shipment_type = fields.Selection([('standard','Standard'),('express','Express')], default='standard')

    def confirm_shipment(self):
        employee = self.env['shipping.employee'].search([('user_id', '=', self.env.uid)], limit=1)
        shipment_name = self.env['ir.sequence'].next_by_code('shipping.shipment') or 'New Shipment'

        vals = {
            'name': shipment_name,
            'client_id': self.client_id.id,
            'employee_id': employee.id if employee else False,
            'notes': self.notes,
            'weight': self.weight,
            'shipment_date': self.shipment_date,
            'shipment_type': self.shipment_type,
        }

        self.env['shipping.shipment'].create(vals)
        return {'type': 'ir.actions.act_window_close'}
