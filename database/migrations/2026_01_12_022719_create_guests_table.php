<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('guests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invitation_id')->constrained()->cascadeOnDelete();

            $table->string('type');
            $table->string('display_name');

            $table->string('contact_name')->nullable();
            $table->string('contact_phone')->nullable();
            $table->string('contact_email')->nullable();

            $table->unsignedInteger('seats_reserved')->default(1);
            $table->unsignedInteger('seats_confirmed')->default(0);

            $table->string('status')->default('pending'); //pending, confirmed, declined

            $table->json('member_names')->nullable(); //Optional (si sabes el nombre de los invitados)
            $table->text('note')->nullable();

            $table->timestamps();

            $table->index(['invitation_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('guests');
    }
};
