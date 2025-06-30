class UsuarioDTO {
    constructor(data = {}) {
        this.id = data.id || null;
        this.nombre = data.nombre || '';
        this.email = data.email || '';
        this.password = data.password || '';
        this.telefono = data.telefono || null;
        this.rol = data.rol || 'cliente';
        this.activo = data.activo !== undefined ? data.activo : true;
        this.createdAt = data.createdAt || null;
        this.updatedAt = data.updatedAt || null;
    }

    // Para crear usuario (sin password en respuesta)
    toPublic() {
        const { password, ...publicData } = this;
        return publicData;
    }

    // Para validar datos de entrada
    static validate(data) {
        const errors = [];

        if (!data.nombre || data.nombre.trim().length === 0) {
            errors.push('El nombre es requerido');
        }

        if (!data.email || !this.isValidEmail(data.email)) {
            errors.push('Email válido es requerido');
        }

        if (!data.password || data.password.length < 6) {
            errors.push('Password debe tener al menos 6 caracteres');
        }

        if (data.rol && !['admin', 'empleado', 'cliente'].includes(data.rol)) {
            errors.push('Rol debe ser admin, empleado o cliente');
        }

        return { isValid: errors.length === 0, errors };
    }

    static isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
}

module.exports = UsuarioDTO;