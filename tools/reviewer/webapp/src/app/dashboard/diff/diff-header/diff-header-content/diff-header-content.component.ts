import { Component, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';

import { Diff, Reviewer } from '@/shared/proto';
import { AuthService, DiffUpdateService } from '@/shared/services';
import { AddUserDialogComponent } from '../add-user-dialog';
import { DiffHeaderService } from '../diff-header.service';

// The component implements content of the header
// How it looks: https://i.imgur.com/TgqzvTW.jpg
@Component({
  selector: 'diff-header-content',
  templateUrl: './diff-header-content.component.html',
  styleUrls: ['./diff-header-content.component.scss'],
  providers: [DiffHeaderService],
})
export class DiffHeaderContentComponent implements OnInit {
  description: string = '';
  isDescriptionEditMode: boolean = false;
  @Input() diff: Diff;

  constructor(
    public authService: AuthService,
    public diffUpdateService: DiffUpdateService,
    public diffHeaderService: DiffHeaderService,
    public dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.description = this.diff.getDescription();
  }

  changeAttention(email: string): void {
    // Get reviewer
    const reviewer: Reviewer = this.diffHeaderService.getReviewer(
      this.diff,
      email,
    );
    if (!reviewer) {
      throw new Error('Reviewer not found');
    }

    // Change attention of the reviewer
    this.diffHeaderService.changeAttention(reviewer);

    // Send changes to firebase
    const username: string = this.authService.getUsername(reviewer.getEmail());
    this.diffUpdateService.updateAttention(this.diff, username);
  }

  // Is the email present in the CC list?
  isCcAlreadyPresent(diff: Diff, email: string): boolean {
    for (const cc of diff.getCcList()) {
      if (cc === email) {
        return true;
      }
    }
    return false;
  }

  // Open "add reviewer" dialog
  addReviewer(): void {
    this.openDialog().afterClosed().subscribe((email: string) => {
      if (email && !this.diffHeaderService.getReviewer(this.diff, email)) {
        const reviewer = new Reviewer();
        reviewer.setEmail(email);
        reviewer.setNeedsAttention(true);
        reviewer.setApproved(false);
        this.diff.addReviewer(reviewer);
        this.saveUserToFirebase(email);
      }
    });
  }

  // Open "add cc" dialog
  addCC(): void {
    this.openDialog().afterClosed().subscribe((email: string) => {
      if (email && !this.isCcAlreadyPresent(this.diff, email)) {
        this.diff.addCc(email);
        this.saveUserToFirebase(email);
      }
    });
  }

  openDialog(): MatDialogRef<AddUserDialogComponent> {
    return this.dialog.open(AddUserDialogComponent);
  }

  removeFromReviewerList(email: string): void {
    this.diffHeaderService.removeFromReviewerList(this.diff, email);
    this.removeUserFromFirebase(email);
  }

  removeFromCcList(email: string): void {
    this.diffHeaderService.removeFromCcList(this.diff, email);
    this.removeUserFromFirebase(email);
  }

  saveUserToFirebase(email: string): void {
    this.updateUserListInFirebase(email, 'added');
  }

  removeUserFromFirebase(email: string): void {
    this.updateUserListInFirebase(email, 'removed');
  }

  updateUserListInFirebase(email: string, action: string): void {
    const username: string = this.authService.getUsername(email);
    this.diffUpdateService.customUpdate(this.diff, username + ' is ' + action);
  }

  startDescriptionEditMode(): void {
    this.isDescriptionEditMode = true;
  }

  stopDescriptionEditMode(): void {
    this.description = this.diff.getDescription();
    this.isDescriptionEditMode = false;
  }

  saveDescription(): void {
    this.diff.setDescription(this.description);
    this.diffUpdateService.updateDescription(this.diff);
    this.isDescriptionEditMode = false;
  }
}
