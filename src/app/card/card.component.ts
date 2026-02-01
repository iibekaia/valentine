import { Component, signal, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.component.html'
})
export class CardComponent implements AfterViewInit, OnDestroy {
  @ViewChild('noBtn') noBtn!: ElementRef<HTMLButtonElement>;
  
  answered = signal(false);
  saidYes = signal(false);
  noPosition = signal<{ position: 'relative' | 'fixed', left: number, top: number }>({ 
    position: 'relative', 
    left: 0, 
    top: 0 
  });
  confettiPieces = Array.from({ length: 10 }, (_, i) => i);
  
  // Different texts for the NO button
  private noButtonTexts = [
    'არა',
    'დარწმუნებული ხარ?',
    'კაიიიი?',
    'დაფიქრდი!',
    'ბეიიბ? 🥺',
    'ცოტა მაინდ დაფიქდი?',
    'უბრალოდ კი-ს დააჭირე!',
    'კაი რაა...',
    'შანსი მომე!',
    'კაი აწი!',
    'მეწყინება 😢',
    'რატოოოო? 💔',
    'უკანასკნელი შანსი!',
    'მაინც არა?'
  ];
  noButtonText = signal('No');
  
  private escapeCount = 0;
  private boundMouseMove: (e: MouseEvent) => void;
  private isEscaping = false;

  constructor() {
    this.boundMouseMove = this.checkProximity.bind(this);
  }

  ngAfterViewInit(): void {
    document.addEventListener('mousemove', this.boundMouseMove);
  }

  ngOnDestroy(): void {
    document.removeEventListener('mousemove', this.boundMouseMove);
  }

  private checkProximity(e: MouseEvent): void {
    if (this.answered() || this.isEscaping || !this.noBtn?.nativeElement) return;
    
    const btn = this.noBtn.nativeElement;
    const rect = btn.getBoundingClientRect();
    
    // Calculate distance from mouse to button edges (not center)
    const btnLeft = rect.left;
    const btnRight = rect.right;
    const btnTop = rect.top;
    const btnBottom = rect.bottom;
    
    // Find closest point on button to mouse
    const closestX = Math.max(btnLeft, Math.min(e.clientX, btnRight));
    const closestY = Math.max(btnTop, Math.min(e.clientY, btnBottom));
    
    // Distance from mouse to closest point on button
    const distance = Math.sqrt(
      (e.clientX - closestX) ** 2 + 
      (e.clientY - closestY) ** 2
    );
    
    // Escape when mouse is within 150px of button edge
    if (distance < 150) {
      this.escapeButton(e.clientX, e.clientY);
    }
  }

  escapeButton(mouseX?: number, mouseY?: number): void {
    if (this.answered() || this.isEscaping) return;
    
    this.isEscaping = true;
    this.escapeCount++;
    
    const padding = 80;
    const btnWidth = 120;
    const btnHeight = 50;
    const maxX = window.innerWidth - btnWidth - padding;
    const maxY = window.innerHeight - btnHeight - padding;
    
    let newX: number;
    let newY: number;
    const currentMouseX = mouseX ?? window.innerWidth / 2;
    const currentMouseY = mouseY ?? window.innerHeight / 2;
    
    // Generate position that's far from mouse
    let attempts = 0;
    do {
      newX = padding + Math.random() * (maxX - padding);
      newY = padding + Math.random() * (maxY - padding);
      attempts++;
      
      const dist = Math.sqrt((newX - currentMouseX) ** 2 + (newY - currentMouseY) ** 2);
      if (dist > 300) break; // Must be at least 300px away
    } while (attempts < 20);
    
    this.noPosition.set({
      position: 'fixed',
      left: newX,
      top: newY
    });
    
    // Change button text
    const textIndex = this.escapeCount % this.noButtonTexts.length;
    this.noButtonText.set(this.noButtonTexts[textIndex]);
    
    // Small delay to prevent rapid-fire escaping
    setTimeout(() => {
      this.isEscaping = false;
    }, 100);
  }

  onYes(): void {
    this.answered.set(true);
    this.saidYes.set(true);
  }

  onNo(): void {
    this.answered.set(true);
    this.saidYes.set(false);
  }

  resetNoToStart(): void {
    if (this.answered()) return;
    this.noPosition.set({ position: 'relative', left: 0, top: 0 });
    this.noButtonText.set(this.noButtonTexts[0]);
  }

  reset(): void {
    this.answered.set(false);
    this.saidYes.set(false);
    this.noPosition.set({ position: 'relative', left: 0, top: 0 });
    this.noButtonText.set(this.noButtonTexts[0]);
    this.escapeCount = 0;
  }

  getRandomX(): string {
    return (Math.random() * 100 - 50) + 'px';
  }
}
