/** @odoo-module **/
import { registry } from '@web/core/registry';
const { Component, useState, onWillStart, useRef } = owl;
import { useService } from '@web/core/utils/hooks';

export class OwlShipmentList extends Component {
    static props = {
        action: Object,
        actionId: Number,
        updateActionState: Function,
        className: String,
    };

    setup() {
        this.orm = useService("orm");            // <<use in (search read - create - write - unlink)

        this.state = useState({
            shipment: {
                weight: 0,
                shipment_type: 'standard',
                state: 'pending',
                client_id: false,
                employee_id: false,
                name: '',
            },
            shipments: [],
            clients: [],
            employees: [],
            isEdit: false,                  //add or edite?
            activeId: false,
        });

        this.searchInput = useRef("search-input");

        onWillStart(async () => {                   //for get data
            await this.getClients();
            await this.getEmployees();
            await this.getShipments();
        });
    }

        // ===== GET SHIPMENT:) =====
    async getShipments() {
        const shipments = await this.orm.searchRead(
            'shipping.shipment',
            [],
            ['weight','shipment_type','state','client_id','employee_id','name']
        );
                            // TODO: Study code
        this.state.shipments = shipments.map(s => ({        // <كود تحويل >
            ...s,
            client_name: s.client_id ? s.client_id[1] : '',      //condition ? value_if_true : value_if_false

            employee_name: s.employee_id ? s.employee_id[1] : '',
        }));
    }

    // =====GET CLIENT =====
    async getClients() {
        this.state.clients = await this.orm.searchRead(
            'shipping.client',
            [],
            ['name']
        );
    }

    // ===== GET EMPLOYEE =====
    async getEmployees() {
        this.state.employees = await this.orm.searchRead(
            'shipping.employee',
            [],
            ['name']
        );
    }

    // ===== إضافة شحنة جديدة =====
    addShipment() {
       // TODO: Study code
        let lastId = 0;
        if (this.state.shipments.length > 0) {
            const lastShipment = this.state.shipments[this.state.shipments.length - 1];
            const match = lastShipment.name?.match(/(\d+)$/);
            if (match) lastId = parseInt(match[1], 10);
        }
        lastId += 1;

        this.state.shipment = {
            weight: 0,
            shipment_type: 'standard',
            state: 'pending',
            client_id: false,
            employee_id: false,
            name: `SHIP-${lastId.toString().padStart(3,'0')}`,      //TODO: الشكل SHIP-001, SHIP-002
        };
        this.state.isEdit = false;
        this.state.activeId = false;
    }

    // ===== تعديل شحنة =====
    editShipment(shipment) {
        this.state.activeId = shipment.id;
        this.state.isEdit = true;
        // نسخ فقط الحقول الفعلية
        this.state.shipment = {
            weight: shipment.weight,
            shipment_type: shipment.shipment_type,
            state: shipment.state,
            client_id: shipment.client_id,
            employee_id: shipment.employee_id,
            name: shipment.name,
        };
    }

    // ===== حفظ الشحنة =====
    async saveShipment() {
        const s = this.state.shipment;

        // تحويل IDs لأرقام
        const data = {
            weight: s.weight,
            shipment_type: s.shipment_type,
            state: s.state,
            client_id: s.client_id ? parseInt(s.client_id, 10) : false,
            employee_id: s.employee_id ? parseInt(s.employee_id, 10) : false,
            name: s.name,
        };

        if (!data.client_id) return alert("Please select a Client!");

        if (this.state.isEdit && this.state.activeId) {
            await this.orm.write('shipping.shipment', [this.state.activeId], data);
        } else {
            await this.orm.create('shipping.shipment', [data]);
        }

        await this.getShipments();
        this.addShipment(); // إعادة تهيئة النموذج
    }

    // ===== حذف شحنة =====
    async deleteShipment(shipment) {
        if (!shipment.id) return;
        await this.orm.unlink('shipping.shipment', [shipment.id]);
        await this.getShipments();
        this.addShipment();
    }

    // ===== البحث =====
    async searchShipment() {
        if (!this.searchInput.el) return;
        const text = this.searchInput.el.value;
        const shipments = await this.orm.searchRead(
            'shipping.shipment',
            [['name','ilike',text]],
            ['weight','shipment_type','state','client_id','employee_id','name']
        );

        this.state.shipments = shipments.map(s => ({
            ...s,
            client_name: s.client_id ? s.client_id[1] : '',
            employee_name: s.employee_id ? s.employee_id[1] : '',
        }));
    }
}

// ===== ربط الكمبوننت بالـ template =====
OwlShipmentList.template = 'trade_flow.ShipmentList';
registry.category('actions').add('shipment_list.action_js', OwlShipmentList);
