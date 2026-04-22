'use client';

import { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import styles from './page.module.css';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';

interface FaqItem {
    question: string;
    answer: string;
    category: string;
}

export default function FaqPage() {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [activeCategory, setActiveCategory] = useState('todos');

    useEffect(() => {
        AOS.init({
            duration: 800,
            once: true,
            offset: 100,
        });
    }, []);

    const categories = [
        { id: 'todos', name: 'Todas' },
        { id: 'pedidos', name: 'Pedidos' },
        { id: 'envios', name: 'Envíos' },
        { id: 'devoluciones', name: 'Devoluciones' },
        { id: 'pagos', name: 'Pagos' },
        { id: 'productos', name: 'Productos' },
    ];

    const faqs: FaqItem[] = [
        // Pedidos
        {
            category: 'pedidos',
            question: '¿Cómo puedo realizar un pedido?',
            answer: 'Para realizar un pedido, simplemente navega por nuestros productos, selecciona las prendas que te gusten, elige talla y color, y agrégalas al carrito. Luego, procede al checkout, ingresa tus datos de envío y selecciona el método de pago. ¡Listo! Recibirás una confirmación por correo electrónico.'
        },
        {
            category: 'pedidos',
            question: '¿Puedo modificar mi pedido después de realizarlo?',
            answer: 'Si tu pedido aún no ha sido procesado, puedes contactarnos a hola@velvet.com para solicitar modificaciones. Una vez que el pedido está en proceso de preparación, no es posible modificarlo.'
        },
        {
            category: 'pedidos',
            question: '¿Cómo puedo cancelar un pedido?',
            answer: 'Puedes cancelar tu pedido dentro de las primeras 2 horas después de realizarlo. Contáctanos a través de nuestro chat o correo electrónico con el número de tu pedido.'
        },
        // Envíos
        {
            category: 'envios',
            question: '¿Cuánto tiempo tarda el envío?',
            answer: 'Los envíos a Lima Metropolitana tardan de 2 a 3 días hábiles. Para provincias, el tiempo de entrega es de 4 a 7 días hábiles. Los pedidos realizados antes de las 2pm se procesan el mismo día.'
        },
        {
            category: 'envios',
            question: '¿Cuánto cuesta el envío?',
            answer: 'El costo de envío es de S/15 para todo Perú. Los pedidos superiores a S/200 tienen envío GRATIS.'
        },
        {
            category: 'envios',
            question: '¿Hacen envíos internacionales?',
            answer: 'Actualmente solo realizamos envíos dentro de Perú. Próximamente expandiremos a nivel internacional.'
        },
        // Devoluciones
        {
            category: 'devoluciones',
            question: '¿Puedo devolver un producto?',
            answer: 'Sí, tienes 30 días calendario desde que recibes tu pedido para solicitar una devolución. El producto debe estar en las mismas condiciones en que lo recibiste, con etiquetas y empaque original.'
        },
        {
            category: 'devoluciones',
            question: '¿Cómo solicito una devolución?',
            answer: 'Para solicitar una devolución, envía un correo a devoluciones@velvet.com con tu número de pedido y el motivo de la devolución. Te enviaremos las instrucciones para completar el proceso.'
        },
        {
            category: 'devoluciones',
            question: '¿Quién paga el costo del envío de devolución?',
            answer: 'Si la devolución es por un error nuestro (producto defectuoso o incorrecto), asumimos el costo del envío. Si es por cambio de opinión, el costo corre por cuenta del cliente.'
        },
        // Pagos
        {
            category: 'pagos',
            question: '¿Qué métodos de pago aceptan?',
            answer: 'Aceptamos tarjetas de crédito y débito (Visa, Mastercard), Yape, Plin, transferencia bancaria y pago contraentrega (solo Lima Metropolitana).'
        },
        {
            category: 'pagos',
            question: '¿Es seguro comprar en Velvet?',
            answer: 'Sí, utilizamos plataformas de pago seguras y encriptadas. Tus datos están protegidos y nunca compartimos tu información con terceros.'
        },
        {
            category: 'pagos',
            question: '¿Puedo pagar contraentrega?',
            answer: 'Sí, ofrecemos pago contraentrega solo para Lima Metropolitana. El pago se realiza en efectivo al momento de recibir tu pedido.'
        },
        // Productos
        {
            category: 'productos',
            question: '¿Cómo sé mi talla?',
            answer: 'Contamos con una guía de tallas detallada en la página de cada producto. También puedes contactarnos para ayudarte a elegir la talla correcta según tus medidas.'
        },
        {
            category: 'productos',
            question: '¿Los productos son exactamente como en las fotos?',
            answer: 'Hacemos todo lo posible para que las imágenes representen fielmente los productos. Sin embargo, los colores pueden variar ligeramente según la configuración de tu pantalla.'
        },
        {
            category: 'productos',
            question: '¿Qué hago si el producto que quiero está agotado?',
            answer: 'Puedes activar la notificación de "Avísame cuando esté disponible" en la página del producto, y te enviaremos un correo cuando vuelva a tener stock.'
        },
    ];

    const filteredFaqs = activeCategory === 'todos'
        ? faqs
        : faqs.filter(faq => faq.category === activeCategory);

    const toggleFaq = (index: number) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <>
        <Navbar />
            <div className={styles.container}>
                {/* Hero Section */}
                <section className={styles.hero} data-aos="fade-in">
                    <div className={styles.heroContent}>
                        <h1 className={styles.heroTitle}>Preguntas Frecuentes</h1>
                        <p className={styles.heroSubtitle}>
                            Resolvemos tus dudas para que tu experiencia sea perfecta
                        </p>
                    </div>
                </section>

                {/* Categorías */}
                <section className={styles.categoriesSection} data-aos="fade-up">
                    <div className={styles.categoriesContainer}>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                className={`${styles.categoryBtn} ${activeCategory === cat.id ? styles.active : ''}`}
                                onClick={() => setActiveCategory(cat.id)}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </section>

                {/* FAQ Accordion */}
                <section className={styles.faqSection} data-aos="fade-up">
                    <div className={styles.faqContainer}>
                        {filteredFaqs.map((faq, index) => (
                            <div
                                key={index}
                                className={`${styles.faqItem} ${activeIndex === index ? styles.active : ''}`}
                            >
                                <button
                                    className={styles.faqQuestion}
                                    onClick={() => toggleFaq(index)}
                                >
                                    <span>{faq.question}</span>
                                    <i className={`pi ${activeIndex === index ? 'pi-minus' : 'pi-plus'}`}></i>
                                </button>
                                <div className={styles.faqAnswer}>
                                    <p>{faq.answer}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Contacto */}
                <section className={styles.contactSection} data-aos="zoom-in">
                    <div className={styles.contactContent}>
                        <i className="pi pi-headphones"></i>
                        <h3>¿Aún tienes dudas?</h3>
                        <p>Nuestro equipo de atención al cliente está disponible para ayudarte</p>
                        <div className={styles.contactButtons}>
                            <a href="mailto:hola@velvet.com" className={styles.contactBtn}>
                                <i className="pi pi-envelope"></i>
                                hola@velvet.com
                            </a>
                            <a href="tel:+51987654321" className={styles.contactBtn}>
                                <i className="pi pi-phone"></i>
                                +51 987 654 321
                            </a>
                        </div>
                        <div className={styles.hours}>
                            <i className="pi pi-clock"></i>
                            Lunes a Viernes: 9am - 6pm | Sábados: 9am - 1pm
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
        </>
    );
}