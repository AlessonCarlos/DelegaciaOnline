// High contrast mode toggle
document.addEventListener('DOMContentLoaded', function() {
    const contrastToggle = document.getElementById('contrast-toggle');
    if (contrastToggle) {
        contrastToggle.addEventListener('click', function() {
            document.body.classList.toggle('high-contrast');
            
            // Salvar preferência no localStorage
            if (document.body.classList.contains('high-contrast')) {
                localStorage.setItem('highContrast', 'enabled');
            } else {
                localStorage.setItem('highContrast', 'disabled');
            }
        });
        
        // Verificar preferência salva
        if (localStorage.getItem('highContrast') === 'enabled') {
            document.body.classList.add('high-contrast');
        }
    }
});