<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
   public function index(Request $request)
    {
    $transactions = $request->user()
        ->transactions()
        ->with('user')
        ->latest()
        ->get();

    return response()->json($transactions);
    }
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
    $data = $request->validate([
        'amount' => ['required', 'numeric', 'min:0'],
        'cpf' => ['required', 'digits:11'],
        'status' => ['required', 'in:Em processamento,Aprovada,Negada'],
        'document' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
    ]);

    $data['user_id'] = $request->user()->id;

    if ($request->hasFile('document')) {
        $data['document'] = $request->file('document')->store('documents', 'public');
    }

    $transaction = Transaction::create($data);

    return response()->json($transaction, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, string $id)
    {
    $transaction = $request->user()
        ->transactions()
        ->with('user')
        ->findOrFail($id);

    return response()->json($transaction);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
    $transaction = $request->user()
        ->transactions()
        ->findOrFail($id);

    $data = $request->validate([
        'amount' => ['sometimes', 'numeric', 'min:0'],
        'cpf' => ['sometimes', 'digits:11'],
        'status' => ['sometimes', 'in:Em processamento,Aprovada,Negada'],
    ]);

    $transaction->update($data);

    return response()->json($transaction);
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, string $id)
    {
    $transaction = $request->user()
        ->transactions()
        ->findOrFail($id);

    $transaction->delete();

    return response()->json([
        'message' => 'Transação excluída com sucesso.',
    ]);
    }
}
