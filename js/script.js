const cards = document.getElementById('cards')
const items = document.getElementById('items')
const footer = document.getElementById('footer')
const templateCard = document.getElementById('plantilla-tarjeta').content
const templateFooter = document.getElementById('plantilla-total').content
const templateCarrito = document.getElementById('plantilla-carrito').content
const fragment = document.createDocumentFragment()
let carrito = {}

function searchFilter(input, selector){
    document.addEventListener("keyup",(e)=>{
        if(e.target.matches(input)){
            console.log(e.target.value);
            document.querySelectorAll(selector).forEach(element =>
                (element.textContent.toLowerCase().includes(e.target.value))? element.classList.remove("filter"): element.classList.add("filter"))
        }
    })
}

searchFilter(".card-filter", ".card");

document.addEventListener('DOMContentLoaded', e => { 
    fetchData() 
    if (localStorage.getItem('carrito')) {
        carrito = JSON.parse(localStorage.getItem('carrito'))
        llenarCarrito()
    }
});
cards.addEventListener('click', e => { addCarrito(e) });
items.addEventListener('click', e => { btnAumentarDisminuir(e) })

const fetchData = async () => {
    const res = await fetch('js/stock.json');
    const data = await res.json()
    agregarTarjetas(data)
}

const agregarTarjetas = data => {
    data.forEach(item => {
        templateCard.querySelector('h5').textContent = item.title
        templateCard.querySelector('p').textContent = item.precio
        templateCard.querySelector('button').dataset.id = item.id
        const clone = templateCard.cloneNode(true)
        fragment.appendChild(clone)
    })
    cards.appendChild(fragment)
}

const addCarrito = e => {
    if (e.target.classList.contains('btn-dark')) {
        setCarrito(e.target.parentElement)
    }
    e.stopPropagation()
    Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: 'Agregado al carrito',
        showConfirmButton: false,
        timer: 750
    })
}

const setCarrito = item => {
    const producto = {
        title: item.querySelector('h5').textContent,
        precio: item.querySelector('p').textContent,
        id: item.querySelector('button').dataset.id,
        cantidad: 1
    }
    if (carrito.hasOwnProperty(producto.id)) {
        producto.cantidad = carrito[producto.id].cantidad + 1
    }

    carrito[producto.id] = { ...producto }
    
    llenarCarrito()
}

const llenarCarrito = () => {
    items.innerHTML = ''

    Object.values(carrito).forEach(producto => {
        templateCarrito.querySelector('th').textContent = producto.id
        templateCarrito.querySelectorAll('td')[0].textContent = producto.title
        templateCarrito.querySelectorAll('td')[1].textContent = producto.cantidad
        templateCarrito.querySelector('span').textContent = producto.precio * producto.cantidad
        
        //botones
        templateCarrito.querySelector('.btn-info').dataset.id = producto.id
        templateCarrito.querySelector('.btn-danger').dataset.id = producto.id

        const clone = templateCarrito.cloneNode(true)
        fragment.appendChild(clone)
    })
    items.appendChild(fragment)

    llenarTotal()
    localStorage.setItem('carrito', JSON.stringify(carrito))
    
}

const llenarTotal = () => {
    footer.innerHTML = ''
    
    if (Object.keys(carrito).length === 0) {
        footer.innerHTML = `
        <th scope="row" colspan="5">Carrito vacío</th>
        `
        return
    }
    
    const nCantidad = Object.values(carrito).reduce((acc, { cantidad }) => acc + cantidad, 0)
    const nPrecio = Object.values(carrito).reduce((acc, {cantidad, precio}) => acc + cantidad * precio ,0)

    templateFooter.querySelectorAll('td')[0].textContent = nCantidad
    templateFooter.querySelector('span').textContent = nPrecio

    const clone = templateFooter.cloneNode(true)
    fragment.appendChild(clone)

    footer.appendChild(fragment)

    const boton = document.querySelector('#vaciar-carrito')
    boton.addEventListener('click', () => {
        carrito = {}
        llenarCarrito()
    })

    
    const botonCompra = document.querySelector('#comprar-carrito')
    botonCompra.addEventListener('click', () => {
        Swal.fire({
            title: 'Confirma la compra?',
            text: `El costo total es de $ ${nPrecio}`,
            icon: 'info',
            input: 'email',
            inputPlaceholder: 'Ingrese el mail para recibir su compra',
            inputAttributes: {
                autocapitalize: 'off'
            },
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si, comprar!'
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire(
                'Comprado!',
                'Recibira una mail con la confirmación.',
                'Completado'
            )
            carrito = {}
            llenarCarrito()
            }
        })
        
    })

}

const btnAumentarDisminuir = e => {
    if (e.target.classList.contains('btn-info')) {
        const producto = carrito[e.target.dataset.id]
        producto.cantidad++
        carrito[e.target.dataset.id] = { ...producto }
        llenarCarrito()
    }

    if (e.target.classList.contains('btn-danger')) {
        const producto = carrito[e.target.dataset.id]
        producto.cantidad--
        if (producto.cantidad === 0) {
            delete carrito[e.target.dataset.id]
        } else {
            carrito[e.target.dataset.id] = {...producto}
        }
        llenarCarrito()
    }
    e.stopPropagation()
}